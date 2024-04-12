import express from 'express';
import { jwtCheck, jwtParse } from '../middlewares/auth';
import multer from 'multer';
import { CreateMyRestaurant, getMyRestaurant, updateMyRestaurant } from '../controllers/RestaurentController';
import { validateRestaurant } from '../middlewares/validation';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits : {
        fileSize : 5 * 1024 * 1024 //5Mb
    }
})
// jwtCheck, jwtParse,
router.route('/getMyRestaurant').get(jwtCheck,jwtParse, getMyRestaurant)
router.route('/createMyRestaurant').post(jwtCheck, jwtParse, upload.single('imageFile'),validateRestaurant,  CreateMyRestaurant)
router.route('/updateMyRestaurant').put(jwtCheck, jwtParse, upload.single('imageFile'),validateRestaurant,  updateMyRestaurant)


export default router;