import express from 'express';
import { createUser, getCurrentUser, updateCurrentUser } from '../controllers/UserController';
import { jwtCheck, jwtParse } from '../middlewares/auth';
import { validateUserRequest } from '../middlewares/validation';


const router = express.Router();

router.route('/getUser').get(jwtCheck, jwtParse, getCurrentUser)
router.route('/register').post(jwtCheck, createUser)
// validateUserRequest not worked need to check
router.route('/updateUser').put(jwtCheck, jwtParse, updateCurrentUser)

export default router;