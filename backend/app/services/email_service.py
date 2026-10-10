"""Outbound email helpers (welcome messages, etc.)."""
from __future__ import annotations

import logging
import smtplib
import ssl
from email.message import EmailMessage
from typing import Optional

import urllib.error
import urllib.request
import json

from app.core.config import settings

logger = logging.getLogger(__name__)


def email_configured() -> bool:
    if settings.RESEND_API_KEY and settings.EMAIL_FROM:
        return True
    if settings.SMTP_HOST and settings.EMAIL_FROM:
        return True
    return False


def send_email(to: str, subject: str, text_body: str, html_body: Optional[str] = None) -> bool:
    """
    Send an email via Resend (preferred) or SMTP.
    Returns True on success. Logs and returns False on failure.
    Never raises to callers used from request handlers.
    """
    to = (to or "").strip()
    if not to:
        logger.warning("send_email skipped: empty recipient")
        return False

    if not email_configured():
        logger.warning(
            "Email not configured. Set RESEND_API_KEY + EMAIL_FROM "
            "or SMTP_HOST + EMAIL_FROM to enable outbound mail."
        )
        return False

    try:
        if settings.RESEND_API_KEY:
            return _send_via_resend(to, subject, text_body, html_body)
        return _send_via_smtp(to, subject, text_body, html_body)
    except Exception:
        logger.exception("Failed to send email to %s", to)
        return False


def send_welcome_email(to_email: str, name: str) -> bool:
    display_name = (name or "").strip() or "there"
    subject = "Welcome to Mercy Gold Honey — thank you for joining us"
    text_body = (
        f"Hi {display_name},\n\n"
        "Thank you for creating an account with Mercy Gold Honey.\n\n"
        "We're glad you're here. Explore our pure, naturally harvested honey "
        "and enjoy shopping with us.\n\n"
        "If you did not create this account, you can ignore this email.\n\n"
        "Warm regards,\n"
        "The Mercy Gold Honey team\n"
    )
    html_body = f"""\
<!DOCTYPE html>
<html>
  <body style="font-family: Georgia, serif; color: #2c1a00; line-height: 1.5;">
    <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
      <p style="color: #b8860b; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px;">
        Mercy Gold Honey
      </p>
      <h1 style="font-size: 24px; margin: 0 0 16px;">Welcome, {display_name}!</h1>
      <p>Thank you for creating an account with <strong>Mercy Gold Honey</strong>.</p>
      <p>
        We're glad you're here. Explore our pure, naturally harvested honey
        and enjoy shopping with us.
      </p>
      <p style="margin-top: 24px;">Warm regards,<br/>The Mercy Gold Honey team</p>
      <p style="margin-top: 32px; font-size: 12px; color: #777;">
        If you did not create this account, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>
"""
    return send_email(to_email, subject, text_body, html_body)


def _send_via_resend(
    to: str,
    subject: str,
    text_body: str,
    html_body: Optional[str],
) -> bool:
    payload = {
        "from": settings.EMAIL_FROM,
        "to": [to],
        "subject": subject,
        "text": text_body,
    }
    if html_body:
        payload["html"] = html_body

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if 200 <= resp.status < 300:
                logger.info("Welcome email sent via Resend to %s", to)
                return True
            logger.error("Resend returned status %s", resp.status)
            return False
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        logger.error("Resend HTTP error %s: %s", exc.code, body)
        return False


def _send_via_smtp(
    to: str,
    subject: str,
    text_body: str,
    html_body: Optional[str],
) -> bool:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to
    msg.set_content(text_body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    host = settings.SMTP_HOST
    port = settings.SMTP_PORT
    user = settings.SMTP_USER
    password = settings.SMTP_PASSWORD

    if settings.SMTP_USE_TLS:
        context = ssl.create_default_context()
        with smtplib.SMTP(host, port, timeout=20) as server:
            server.starttls(context=context)
            if user and password:
                server.login(user, password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(host, port, timeout=20) as server:
            if user and password:
                server.login(user, password)
            server.send_message(msg)

    logger.info("Welcome email sent via SMTP to %s", to)
    return True


def _format_money(amount) -> str:
    try:
        return f"KSh {float(amount):,.2f}"
    except (TypeError, ValueError):
        return f"KSh {amount}"


def send_order_confirmation_email(order) -> bool:
    """
    Thank the customer for their order.
    Uses order.shipping_email when set.
    """
    to = (getattr(order, "shipping_email", None) or "").strip()
    if not to:
        logger.info("Order #%s: no shipping_email — skip customer confirmation", order.id)
        return False

    name = (order.shipping_name or "there").strip()
    lines = []
    for item in order.items or []:
        lines.append(
            f"- {item.product_name} × {item.quantity} — {_format_money(item.line_total)}"
        )
    items_text = "\n".join(lines) if lines else "- (items)"

    subject = f"Order #{order.id} confirmed — Mercy Gold Honey"
    text_body = (
        f"Hi {name},\n\n"
        f"Thank you for your order with Mercy Gold Honey.\n\n"
        f"Order number: #{order.id}\n"
        f"Status: {order.status}\n"
        f"Total: {_format_money(order.total_amount)}\n\n"
        f"Items:\n{items_text}\n\n"
        f"Delivery to:\n{order.shipping_name}\n{order.shipping_phone}\n"
        f"{order.shipping_address}\n\n"
        "We will follow up about delivery and payment if needed.\n\n"
        "Warm regards,\n"
        "The Mercy Gold Honey team\n"
        f"{settings.STOREFRONT_URL}\n"
    )
    items_html = "".join(
        f"<li>{item.product_name} × {item.quantity} — "
        f"<strong>{_format_money(item.line_total)}</strong></li>"
        for item in (order.items or [])
    )
    html_body = f"""\
<!DOCTYPE html>
<html>
  <body style="font-family: Georgia, serif; color: #2d241f; line-height: 1.5;">
    <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
      <p style="color: #b7791f; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px;">
        Mercy Gold Honey
      </p>
      <h1 style="font-size: 22px; margin: 0 0 12px;">Order #{order.id} confirmed</h1>
      <p>Hi {name},</p>
      <p>Thank you for your order. We have received it and will be in touch about delivery.</p>
      <p><strong>Status:</strong> {order.status}<br/>
         <strong>Total:</strong> {_format_money(order.total_amount)}</p>
      <p><strong>Items</strong></p>
      <ul>{items_html}</ul>
      <p><strong>Delivery</strong><br/>
        {order.shipping_name}<br/>
        {order.shipping_phone}<br/>
        {order.shipping_address}
      </p>
      <p style="color: #6b625c; font-size: 14px;">
        No online payment is required unless we arrange it with you.
      </p>
      <p>Warm regards,<br/>The Mercy Gold Honey team</p>
    </div>
  </body>
</html>
"""
    return send_email(to, subject, text_body, html_body)


def send_admin_new_order_email(order) -> bool:
    """Notify store staff that a new order was placed."""
    raw = (settings.ADMIN_NOTIFY_EMAIL or "").strip()
    if not raw:
        # Fall back to EMAIL_FROM mailbox local-part is wrong; skip if unset
        logger.info("ADMIN_NOTIFY_EMAIL not set — skip admin order alert")
        return False

    recipients = [r.strip() for r in raw.split(",") if r.strip()]
    name = order.shipping_name or "Customer"
    lines = []
    for item in order.items or []:
        lines.append(f"- {item.product_name} × {item.quantity} ({_format_money(item.line_total)})")
    items_text = "\n".join(lines)

    subject = f"New order #{order.id} — {_format_money(order.total_amount)}"
    text_body = (
        f"New order received on Mercy Gold Honey.\n\n"
        f"Order: #{order.id}\n"
        f"Status: {order.status}\n"
        f"Total: {_format_money(order.total_amount)}\n"
        f"Customer: {name}\n"
        f"Phone: {order.shipping_phone}\n"
        f"Email: {getattr(order, 'shipping_email', None) or '—'}\n"
        f"Address: {order.shipping_address}\n"
        f"Notes: {order.notes or '—'}\n\n"
        f"Items:\n{items_text}\n"
    )
    html_body = f"""\
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; color: #2d241f;">
    <div style="max-width: 560px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #b7791f;">New order #{order.id}</h2>
      <p><strong>Total:</strong> {_format_money(order.total_amount)} · <strong>Status:</strong> {order.status}</p>
      <p><strong>Customer:</strong> {name}<br/>
         <strong>Phone:</strong> {order.shipping_phone}<br/>
         <strong>Email:</strong> {getattr(order, 'shipping_email', None) or '—'}<br/>
         <strong>Address:</strong> {order.shipping_address}</p>
      <pre style="background:#f8f1e3;padding:12px;border-radius:8px;">{items_text}</pre>
    </div>
  </body>
</html>
"""
    ok_any = False
    for to in recipients:
        if send_email(to, subject, text_body, html_body):
            ok_any = True
    return ok_any


def notify_order_placed(order) -> None:
    """Background-safe: customer confirmation + admin alert."""
    try:
        send_order_confirmation_email(order)
    except Exception:
        logger.exception("Customer order email failed for #%s", getattr(order, "id", "?"))
    try:
        send_admin_new_order_email(order)
    except Exception:
        logger.exception("Admin order email failed for #%s", getattr(order, "id", "?"))
