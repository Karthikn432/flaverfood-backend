import { Request, Response } from "express";
import Stripe from "stripe";
import Restaurant, { menuItemType } from "../models/restaurent";
import Order from "../models/order";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;


const getMyOrders = async (req: Request, res: Response) => {

    try {
        const orders = await Order.find({user :  req.userId})
        .populate("restaurant")
        .populate("user");

        res.json(orders)

    } catch (error) {
        console.log({error})
        res.status(500).json({message : "Somethin went wrong"})
    }
}

type CheckoutSessionRequest = {
    cartItems: {
        menuItemId: string;
        name: string;
        quantity: string;

    }[];
    deliveryDetails: {
        email: string;
        name: string;
        addressLine1: string;
        city: string
    };
    restaurantId: string;
}

const stripeWebhookHandler = async (req: Request, res: Response) => {

    let event;

    try {
        const sig = req.headers["stripe-signature"];
        event = STRIPE.webhooks.constructEvent(
            req.body,
            sig as string,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.log(error)
        res.status(400).send(`Webhook error : ${error.message}`)
    }

    if(event?.type === "checkout.session.completed"){
        const order = await Order.findById(event.data.object.metadata?.orderId);

        if(!order){
            return res.status(404).json({message:`Order not found`})
        }

        order.totalAmount = event.data.object.amount_total;
        order.status = "paid";

        await order.save();
        res.status(200).json()
    }

}

const createCheckoutSession = async (req: Request, res: Response) => {

    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;

        const restaurant = await Restaurant.findById(
            checkoutSessionRequest.restaurantId
        )

        if (!restaurant) {
            throw new Error("Restaurant not found")
        }
        console.log({ DD: checkoutSessionRequest.deliveryDetails })
        const newOrder = await new Order({
            restaurant: restaurant,
            user: req.userId,
            status: "placed",
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: checkoutSessionRequest.cartItems,
            createdAt: new Date()
        })
        console.log({ newOrder })
        // console.log({restaurant})
        const lineItems = createLineItems(
            checkoutSessionRequest,
            restaurant.menuItems
        );
        // console.log({ lineItems })

        const session = await createSession(
            lineItems,
            // "TEST_ORDER_ID",
            newOrder._id.toString(),
            restaurant.deliveryPrice , //* 100,
            restaurant._id.toString()
        );

        // console.log({ session })

        if (!session.url) {
            return res.status(500).json({
                message: "Error creating stripe session"
            })
        }
        await newOrder.save()
        res.json({ url: session.url })

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: error.raw.message })
    }

}


const createLineItems = (checkoutSessionRequest: CheckoutSessionRequest, menuItems: menuItemType[]) => {
    // 1. foreach cartitem  get the menuitem object from the restaurant (to get the price)
    // 2. Foreach cartItem, convert it to a stripe line item
    // 3. return line item array

    const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
        const menuItem = menuItems.find(
            (item) => item._id.toString() === cartItem.menuItemId.toString()
        );

        if (!menuItem) {
            throw new Error(`Menu item not found : ${cartItem.menuItemId}`)
        }

        const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: "inr",
                unit_amount: menuItem.price,// * 100,
                product_data: {
                    name: menuItem.name,
                },
            },
            quantity: parseInt(cartItem.quantity)

        };
        console.log({ line_item })
        return line_item;
    });

    return lineItems;
}

const createSession = async (
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    orderId: string,
    deliveryPrice: number,
    restaurantId: string
) => {
    const sessionData = await STRIPE.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: deliveryPrice,
                        currency: "inr",
                    },
                },
            },
        ],
        mode: "payment",
        metadata: {
            orderId,
            restaurantId,
        },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,

    });

    return sessionData;

}

export {
    getMyOrders,
    createCheckoutSession,
    stripeWebhookHandler
}