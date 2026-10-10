from decimal import Decimal
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_active_user, get_current_admin_user, get_optional_user
from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import ALLOWED_STATUSES, OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter(tags=["Orders"])


def _order_query(db: Session):
    return db.query(Order).options(joinedload(Order.items))


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[Optional[User], Depends(get_optional_user)],
):
    """
    Create an order atomically. Authentication is optional (guest checkout).

    Product rows are locked with SELECT FOR UPDATE so concurrent checkouts
    cannot oversell the same stock units.
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    # Lock products in a stable order to reduce deadlock risk
    product_ids = sorted({item.product_id for item in payload.items})
    locked_products = {
        p.id: p
        for p in (
            db.query(Product)
            .filter(Product.id.in_(product_ids))
            .order_by(Product.id)
            .with_for_update()
            .all()
        )
    }

    order_items: list[OrderItem] = []
    total = Decimal("0.00")

    for item in payload.items:
        product = locked_products.get(item.product_id)
        if product is None or not product.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"Product {item.product_id} is not available",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.stock}"
                ),
            )

        line_total = (product.price * item.quantity).quantize(Decimal("0.01"))
        total += line_total

        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                unit_price=product.price,
                quantity=item.quantity,
                line_total=line_total,
            )
        )
        product.stock -= item.quantity

    order = Order(
        user_id=current_user.id if current_user is not None else None,
        status="pending",
        total_amount=total.quantize(Decimal("0.01")),
        shipping_name=payload.shipping_name.strip(),
        shipping_phone=payload.shipping_phone.strip(),
        shipping_address=payload.shipping_address.strip(),
        notes=payload.notes.strip() if payload.notes else None,
        items=order_items,
    )
    db.add(order)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    created = _order_query(db).filter(Order.id == order.id).first()
    return created


@router.get("/orders", response_model=List[OrderResponse])
def list_my_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    orders = (
        _order_query(db)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
        .all()
    )
    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    order = _order_query(db).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if (order.user_id is None or order.user_id != current_user.id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed to view this order")
    return order


@router.get("/admin/orders", response_model=List[OrderResponse])
def admin_list_orders(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin_user)],
    skip: int = 0,
    limit: int = 50,
):
    orders = (
        _order_query(db)
        .order_by(Order.id.desc())
        .offset(skip)
        .limit(min(limit, 100))
        .all()
    )
    return orders


@router.patch("/admin/orders/{order_id}", response_model=OrderResponse)
def admin_update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin_user)],
):
    status_value = payload.status.strip().lower()
    if status_value not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {', '.join(sorted(ALLOWED_STATUSES))}",
        )

    order = _order_query(db).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_value
    db.commit()
    db.refresh(order)
    return _order_query(db).filter(Order.id == order.id).first()
