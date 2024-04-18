import express from 'express';
import { jwtCheck, jwtParse } from '../middlewares/auth';
import { createCheckoutSession, stripeWebhookHandler } from '../controllers/OrderController';


const router = express.Router();
// whsec_10484e8005d15a874962987c2bc0dafd0f1ad07c4a6bc9114cb1067d037a8112
router.route('/checkout/create-checkout-session').post(jwtCheck, jwtParse, createCheckoutSession)
router.route('/checkout/webhook').post(stripeWebhookHandler)

export default router;