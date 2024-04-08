"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.route('/getUser').get(auth_1.jwtCheck, auth_1.jwtParse, UserController_1.getCurrentUser);
router.route('/register').post(auth_1.jwtCheck, UserController_1.createUser);
// validateUserRequest not worked need to check
router.route('/updateUser').put(auth_1.jwtCheck, auth_1.jwtParse, UserController_1.updateCurrentUser);
exports.default = router;
