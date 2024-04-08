"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const UserRoute_1 = __importDefault(require("./routes/UserRoute"));
mongoose_1.default.connect(process.env.MONGODB_CONNECTION_STRING).then(() => { console.log('connected to db'); });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: 'http://localhost:5173',
}));
app.use('/api/', UserRoute_1.default);
app.listen(7000, () => {
    console.log('server listen on 7000');
});
