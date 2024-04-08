"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.updateCurrentUser = exports.createUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = yield user_1.default.findOne({ _id: req.userId });
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(currentUser);
    }
    catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" });
    }
});
exports.getCurrentUser = getCurrentUser;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 1.Check if the user exists
    // 2.Create the user if it doesn't exist
    // 3.Return the user object to the calling client
    try {
        const { auth0Id } = req.body;
        console.log({ dump: req.body });
        const existingUser = yield user_1.default.findOne({ auth0Id });
        if (existingUser) {
            return res.status(200).json({ message: 'User Already Exists' });
        }
        const newUser = new user_1.default(req.body);
        yield newUser.save();
        console.log({ newUser });
        res.status(201).json(newUser.toObject());
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating user"
        });
    }
});
exports.createUser = createUser;
const updateCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log({ req: req.body });
        const { name, addressLine1, country, city } = req.body;
        const user = yield user_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.name = name;
        user.addressLine1 = addressLine1;
        user.country = country;
        user.city = city;
        yield user.save();
        res.send(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Updating User" });
    }
});
exports.updateCurrentUser = updateCurrentUser;
