import express from 'express';
import { jwtCheck, jwtParse } from '../middlewares/auth';
import multer from 'multer';
import { CreateMyRestaurant, getMyRestaurant, getRestaurantItems, searchRestaurants, updateMyRestaurant, getMyRestaurantOrders, updateOrderStatus } from '../controllers/RestaurentController';
import { validateRestaurant } from '../middlewares/validation';
import { param } from 'express-validator';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits : {
        fileSize : 5 * 1024 * 1024 //5Mb
    }
})
// jwtCheck, jwtParse,
router.route('/order').get(jwtCheck,jwtParse, getMyRestaurantOrders)
router.route('/getMyRestaurant').get(jwtCheck,jwtParse, getMyRestaurant)
router.route('/createMyRestaurant').post(jwtCheck, jwtParse, upload.single('imageFile'),validateRestaurant,  CreateMyRestaurant)
router.route('/updateMyRestaurant').put(jwtCheck, jwtParse, upload.single('imageFile'),validateRestaurant,  updateMyRestaurant)
router.route("/search/:city").get(param("city").isString().trim().notEmpty().withMessage("City parameter must be a valid string"),searchRestaurants)
router.route("/:restaurantId").get(param("restaurantId").isString().trim().notEmpty().withMessage("RestaurantId parameter must be a valid string"), getRestaurantItems)
router.route("/order/:orderId").patch(jwtCheck,jwtParse, updateOrderStatus)
export default router;