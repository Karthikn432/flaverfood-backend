import express from 'express';
import cors from 'cors';
import "dotenv/config";
import mongoose from 'mongoose';
import userRoute from './routes/UserRoute';
import restaurantRoute from './routes/RestaurentRoute';
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

app.use(express.json());

app.use(cors({
    credentials: true,
    origin:  'https://flaverfood-frontend.onrender.com' // 'http://localhost:5173' //
}));

app.use('/api/', userRoute);
app.use('/api/restaurant', restaurantRoute);


// Add a middleware to handle preflight requests
app.options('*', cors());

app.listen(7000, () => {
    console.log('server listen on 7000');
});
