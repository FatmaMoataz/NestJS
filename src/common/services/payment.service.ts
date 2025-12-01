import { Injectable } from "@nestjs/common";
import { type Request } from "express";
import Stripe from "stripe";

@Injectable()
export class PaymentService {
private stripe:Stripe
constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET as string)
}

async checkoutSession( {customer_email,
        cancel_url = process.env.CANCEL_URL as string,
        success_url = process.env.SUCCESS_URL as string,
        metadata = {},
        discounts = [],
        mode = "payment",
        line_items}:Stripe.Checkout.SessionCreateParams):Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const session = await this.stripe.checkout.sessions.create({
        customer_email,
        cancel_url,
        success_url,
        metadata,
        discounts,
        mode,
        line_items
    })
    return session
}

async createCoupon (data:Stripe.CouponCreateParams) {
    const coupon = await this.stripe.coupons.create(data)
    return coupon
}

// async webhook(req:Request) {
// const endpointSecret = process.env.STRIPE_HOOK_SECRET as string
// let event;
// event = stripe.webhooks.constructEvent(request.body , sig , endpointSecret)
// switch (event.type) {
//     case 'checkout.session.completed':
//         const checkoutSessionCompleted = event.data.object
//         break;
//     default:
//         console.log(`Unhandled event type ${event.type}`);       
//         break;
// }
// }

}