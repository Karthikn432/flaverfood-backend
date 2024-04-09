import express from 'express';
import { jwtCheck, jwtParse } from '../middlewares/auth';
import multer from 'multer';
import { CreateMyRestaurant } from '../controllers/Restaurent';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits : {
        fileSize : 5 * 1024 * 1024 //5Mb
    }
})

router.route('/register').post(upload.single('imageFile'),jwtCheck, jwtParse, CreateMyRestaurant)

export default router;