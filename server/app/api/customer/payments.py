import hashlib
import hmac
from datetime import datetime, timezone
from typing import List, Optional

import razorpay
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ...config import settings
from ...database import get_db
from ...models import models
from ..auth import get_current_user

router = APIRouter()


class CheckoutItem(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class RazorpayOrderCreateRequest(BaseModel):
    items: List[CheckoutItem]
    discount_value: Optional[float] = 0.0
    discount_type: Optional[str] = None
    shipping_charges: Optional[float] = 0.0
    receipt: Optional[str] = None


class RazorpayPaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


def _calculate_total_amount(payload: RazorpayOrderCreateRequest, db: Session) -> float:
    total_subtotal = 0.0
    total_amount = 0.0

    if not payload.items:
        raise HTTPException(status_code=400, detail="No checkout items provided")

    for item in payload.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found",
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}",
            )

        price_including_gst = product.selling_price or 0.0
        gst_rate = product.gst_rate or 0.0

        taxable_price = (
            price_including_gst / (1 + gst_rate / 100) if gst_rate else price_including_gst
        )
        item_subtotal = taxable_price * item.quantity
        item_total = price_including_gst * item.quantity

        total_subtotal += item_subtotal
        total_amount += item_total

    final_total = total_amount + (payload.shipping_charges or 0.0)

    if payload.discount_type == models.DiscountType.percentage.value:
        final_total -= total_subtotal * ((payload.discount_value or 0) / 100)
    elif payload.discount_type == models.DiscountType.fixed.value:
        final_total -= payload.discount_value or 0

    return max(0, final_total)


@router.post("/razorpay/create-order", status_code=status.HTTP_201_CREATED)
async def create_razorpay_order(
    payload: RazorpayOrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay is not configured on the server",
        )

    final_total = _calculate_total_amount(payload, db)
    amount_in_paise = int(round(final_total * 100))

    if amount_in_paise <= 0:
        raise HTTPException(status_code=400, detail="Invalid payable amount")

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    receipt = payload.receipt or (
        f"rcpt_{current_user.id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    )

    try:
        order = client.order.create(
            {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": receipt,
                "payment_capture": 1,
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Razorpay error: {exc}") from exc

    return {
        "order_id": order.get("id"),
        "amount": order.get("amount"),
        "currency": order.get("currency", "INR"),
        "key_id": settings.RAZORPAY_KEY_ID,
    }


@router.post("/razorpay/verify", status_code=status.HTTP_200_OK)
async def verify_razorpay_payment(
    payload: RazorpayPaymentVerifyRequest,
    current_user: models.User = Depends(get_current_user),
):
    if not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay is not configured on the server",
        )

    signature_payload = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        signature_payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

    return {
        "verified": True,
        "payment_id": payload.razorpay_payment_id,
        "order_id": payload.razorpay_order_id,
        "user_id": current_user.id,
    }
