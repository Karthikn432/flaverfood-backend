import express from 'express';
import { jwtCheck, jwtParse } from '../middlewares/auth';
import { createCheckoutSession, stripeWebhookHandler , getMyOrders} from '../controllers/OrderController';


const router = express.Router();

// Get order item api
router.route('/getMyOrders').get(jwtCheck, jwtParse, getMyOrders)

router.route('/checkout/create-checkout-session').post(jwtCheck, jwtParse, createCheckoutSession)
router.route('/checkout/webhook').post(stripeWebhookHandler)




export default router;