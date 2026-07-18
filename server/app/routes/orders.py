from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from datetime import datetime

from app.constants.order_status import CANCELLED, DELIVERED, PENDING, PICKED_UP
from app.constants.roles import ADMIN, CUSTOMER, RESTAURANT, RIDER
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.food_item import FoodItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.order_schema import OrderCreate, OrderResponse, OrderStatusUpdate
from app.routes.live_tracking import manager as live_tracking_manager
from app.utils.helpers import generate_order_number


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(CUSTOMER, ADMIN)),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id, Restaurant.is_active.is_(True)).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must include at least one item")

    food_item_ids = [item.food_item_id for item in payload.items]
    food_items = (
        db.query(FoodItem)
        .filter(
            FoodItem.id.in_(food_item_ids),
            FoodItem.restaurant_id == payload.restaurant_id,
            FoodItem.is_active.is_(True),
            FoodItem.is_available.is_(True),
        )
        .all()
    )
    food_item_map = {item.id: item for item in food_items}
    if len(food_item_map) != len(set(food_item_ids)):
        raise HTTPException(status_code=400, detail="One or more food items are unavailable")

    subtotal = Decimal("0")
    order = Order(
        order_number=generate_order_number(),
        customer_id=current_user.id,
        restaurant_id=payload.restaurant_id,
        delivery_address_id=payload.delivery_address_id,
        coupon_id=payload.coupon_id,
        status=PENDING,
        delivery_type=payload.delivery_type,
        service_type=payload.service_type,
        payment_method=payload.payment_method,
        subtotal=Decimal("0"),
        delivery_fee=restaurant.delivery_fee,
        discount_amount=Decimal("0"),
        tax_amount=Decimal("0"),
        total_amount=Decimal("0"),
        customer_notes=payload.customer_notes,
    )
    db.add(order)
    db.flush()

    for item_payload in payload.items:
        food_item = food_item_map[item_payload.food_item_id]
        unit_price = food_item.discount_price or food_item.price
        total_price = unit_price * item_payload.quantity
        subtotal += total_price
        db.add(
            OrderItem(
                order_id=order.id,
                food_item_id=food_item.id,
                item_name=food_item.name,
                quantity=item_payload.quantity,
                unit_price=unit_price,
                total_price=total_price,
                special_instructions=item_payload.special_instructions,
            )
        )

    order.subtotal = subtotal
    order.total_amount = subtotal + order.delivery_fee - order.discount_amount + order.tax_amount
    db.commit()
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order.id)
        .first()
    )


@router.get("", response_model=list[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order).options(joinedload(Order.items))
    if current_user.role == CUSTOMER:
        query = query.filter(Order.customer_id == current_user.id)
    elif current_user.role == RESTAURANT:
        owned_restaurants = db.query(Restaurant.id).filter(Restaurant.owner_id == current_user.id)
        query = query.filter(Order.restaurant_id.in_(owned_restaurants))
    elif current_user.role == RIDER:
        from app.models.rider import Rider

        rider = db.query(Rider).filter(Rider.user_id == current_user.id).first()
        if rider is None:
            return []
        query = query.filter(Order.rider_id == rider.id)
    return query.order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role == ADMIN or order.customer_id == current_user.id:
        return order
    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    if current_user.role == RESTAURANT and restaurant and restaurant.owner_id == current_user.id:
        return order
    if current_user.role == RIDER:
        from app.models.rider import Rider

        rider = db.query(Rider).filter(Rider.user_id == current_user.id).first()
        if rider and order.rider_id == rider.id:
            return order
    raise HTTPException(status_code=403, detail="You cannot view this order")


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    allowed = current_user.role == ADMIN or (
        current_user.role == RESTAURANT and restaurant and restaurant.owner_id == current_user.id
    )
    if current_user.role == RIDER:
        from app.models.rider import Rider

        rider = db.query(Rider).filter(Rider.user_id == current_user.id).first()
        if rider and (order.rider_id == rider.id or (order.rider_id is None and payload.rider_id == rider.id)):
            allowed = True
    if not allowed:
        raise HTTPException(status_code=403, detail="You cannot update this order")
    order.status = payload.status
    if payload.rider_id:
        order.rider_id = payload.rider_id
    if payload.cancellation_reason:
        order.cancellation_reason = payload.cancellation_reason
    if payload.status == PICKED_UP:
        order.picked_up_at = datetime.utcnow()
    elif payload.status == DELIVERED:
        order.delivered_at = datetime.utcnow()
    elif payload.status == CANCELLED:
        order.cancelled_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    await live_tracking_manager.broadcast(
        order.id,
        {
            "order_id": order.id,
            "type": "status_update",
            "status": order.status,
            "message": f"Order status updated to {order.status}",
        },
    )
    return order
