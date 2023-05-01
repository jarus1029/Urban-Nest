import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
// import { DATABASE } from './config.js';
import authRoutes from './routes/auth.js';
import adRoutes from './routes/ad.js'
import * as dotenv from 'dotenv'
dotenv.config();

const app=express();

//db
mongoose.set("strictQuery",false);
mongoose.connect(process.env.DATABASE)
.then(()=> console.log("db connected"))
.catch((err)=>console.log(err));

//middlewares

app.use(express.json({limit:"10mb"}));
app.use(morgan("dev"));
app.use(cors());

// when '/api' url is requested the callback function is run a response
// app.get('/api',(req,res)=>{
//     res.json({
//         data:'hello from nodejs api hey!!!!',
//     });
// });
// we have placed the above route in the auth.js

app.use('/api',authRoutes);
app.use('/api',adRoutes)

// to listen port we use app.listen function specify port number and call
//back function to just consolelog
app.listen(8000 ,()=>{
    console.log("server running on port 8000")
});