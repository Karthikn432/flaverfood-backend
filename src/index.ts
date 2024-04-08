import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config";
import mongoose from 'mongoose';
import userRoute from './routes/UserRoute'

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(()=>{console.log('connected to db')})
const app = express();
app.use(express.json());
app.use(cors({
    credentials : true,
    origin: 'http://localhost:5173',
  }))


app.use('/api/',userRoute)

app.listen(7000 , ()=>{
    console.log('server listen on 7000')
})