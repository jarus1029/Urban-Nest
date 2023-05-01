import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv'
dotenv.config();
const JWT_SECRET=process.env.JWT_SECRET;

export const requireSignin=(req,res,next)=>{
    try {
        const decoded=jwt.verify(req.headers.authorization,JWT_SECRET);
        req.user=decoded;//req.user._id
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({error:"Invalid or expired token"})
        
    }
}