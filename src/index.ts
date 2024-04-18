import express, { application } from 'express';
import cors from 'cors';
import "dotenv/config";
import mongoose from 'mongoose';
import userRoute from './routes/UserRoute';
import restaurantRoute from './routes/RestaurentRoute';
import orderRoute from './routes/OrderRoute';
import { Request, Response } from "express";

import { v2 as cloudinary} from "cloudinary";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
    console.log('connected to db');
});

// cloudinary setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

app.use(cors({
    credentials: true,
    origin: 'https://flaverfood-frontend.onrender.com' //  'http://localhost:5173' // 
}));

app.use("/api/order/checkout/webhook", express.raw({type : "*/*"}))

app.use(express.json());


// API Health CheckUp
app.get("/health", async(Req: Request, res:Response) =>{
    res.send({message : "health OK!"})
})

app.use('/api/', userRoute);
app.use('/api/restaurant', restaurantRoute);
app.use('/api/order', orderRoute);


// Add a middleware to handle preflight requests
app.options('*', cors());

app.listen(7000, () => {
    console.log('server listen on 7000');
});
