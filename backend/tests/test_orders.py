def test_create_order_allows_guest(client, sample_product, db):
    response = client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": sample_product.id, "quantity": 1}],
            "shipping_name": "Guest Buyer",
            "shipping_phone": "0700111222",
            "shipping_address": "Nairobi",
        },
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["status"] == "pending"
    assert data.get("user_id") is None
    db.refresh(sample_product)
    assert sample_product.stock == 9



def test_create_order_success(client, user_payload, sample_product, db):
    client.post("/api/v1/auth/register", json=user_payload)

    response = client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": sample_product.id, "quantity": 2}],
            "shipping_name": "Buyer Name",
            "shipping_phone": "0700111222",
            "shipping_address": "Westlands, Nairobi",
            "notes": "Leave at gate",
        },
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["status"] == "pending"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2
    assert float(data["total_amount"]) == 2000.0

    db.refresh(sample_product)
    assert sample_product.stock == 8


def test_create_order_insufficient_stock(client, user_payload, sample_product):
    client.post("/api/v1/auth/register", json=user_payload)
    response = client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": sample_product.id, "quantity": 999}],
            "shipping_name": "Buyer",
            "shipping_phone": "0700111222",
            "shipping_address": "Nairobi",
        },
    )
    assert response.status_code == 400
    assert "stock" in response.json()["detail"].lower()


def test_list_my_orders(client, user_payload, sample_product):
    client.post("/api/v1/auth/register", json=user_payload)
    client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": sample_product.id, "quantity": 1}],
            "shipping_name": "Buyer",
            "shipping_phone": "0700111222",
            "shipping_address": "Nairobi",
        },
    )
    response = client.get("/api/v1/orders")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_admin_list_orders(client, admin_user, user_payload, sample_product):
    # Customer places order
    client.post("/api/v1/auth/register", json=user_payload)
    client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": sample_product.id, "quantity": 1}],
            "shipping_name": "Buyer",
            "shipping_phone": "0700111222",
            "shipping_address": "Nairobi",
        },
    )

    # Admin lists
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpass"},
    )
    response = client.get("/api/v1/admin/orders")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_admin_update_order_status(client, admin_user, user_payload, sample_product):
    client.post("/api/v1/auth/register", json=user_payload)
    created = client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": sample_product.id, "quantity": 1}],
            "shipping_name": "Buyer",
            "shipping_phone": "0700111222",
            "shipping_address": "Nairobi",
        },
    )
    order_id = created.json()["id"]

    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpass"},
    )
    response = client.patch(
        f"/api/v1/admin/orders/{order_id}",
        json={"status": "paid"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "paid"
