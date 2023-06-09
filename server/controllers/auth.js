// import * as config from "../config.js"
import jwt from 'jsonwebtoken'
import {emailTemplate} from '../helpers/email.js'
import {hashPassword,comparePassword} from "../helpers/auth.js"
import User from "../models/user.js";
import Ad from '../models/ad.js'
import {nanoid} from "nanoid";
import SES from 'aws-sdk/clients/ses.js'
import validator from "email-validator"
import * as dotenv from 'dotenv'
dotenv.config();

const CLIENT_URL="http://localhost:3000";
const JWT_SECRET=process.env.JWT_SECRET;
const awsConfig={
  accessKeyId:process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
  region:"eu-north-1",
  apiVersion:"2010-12-01", 
}
const AWSSES=new SES(awsConfig)

export const welcome = (req, res) => {
    res.json({
        data: "hello from nodejs api  !!!",
    });
};

export const preRegister = async (req, res) => {
    try {
        // console.log(req.body);
        const {email,password}=req.body;

        //validations
        if(!validator.validate(email))
        {
          return res.json({error:"A vaild email is required"});
        }
        if(!password)
        {
          return res.json({error:"Password is required"});
        }
        if(password && password?.length<6)
        {
          return res.json({error:"Password should be atleast 6 characters"});
        }

        const user=await User.findOne({email});
        if(user){
          return res.json({error:"Email is taken"})
        }

        const token=jwt.sign({email,password},JWT_SECRET,{expiresIn:"1h"});
        const REPLY_TO="healthytraitors1029@gmail.com"

        AWSSES.sendEmail(
            emailTemplate(
                email,
                ` <p>Please Click the link below to activate your account</p>
                <a href="${CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
                `,
                REPLY_TO,
                'Activate your account'),
            (err, data) => {
            if (err) {
                console.log(err);
                return res.json({ ok: false })
            }
            else {
                console.log(data);
                return res.json({ ok: true })
            }

        })

    } catch (err) {
        console.log(err);
        return res.json({ error: 'Something went wrong.Try Again!!!' })
    }
};
const tokenAndUserResponse=(req,res,user)=>{
  const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  user.password = undefined;
  user.resetCode = undefined;

  return res.json({
    token,
    refreshToken,
    user,
  });

};
export const register = async (req, res) => {
    try {
      // console.log(req.body);
      const { email, password } = jwt.verify(req.body.token,JWT_SECRET); 
      
      const userExist=await User.findOne({email});
      if(userExist){
        return res.json({error:"Email is taken"})
      }

  
      const hashedPassword = await hashPassword(password);
  
      const user = await new User({
        username: nanoid(6),
        email,
        password: hashedPassword,
      }).save();
  
      tokenAndUserResponse(req,res,user);
    } catch (err) {
      console.log(err);
      return res.json({ error: "Something went wrong. Try again." });
    }
  };

  export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      // 1. find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ error: "Please register first" });
      }
      // 2. compare password
      // console.log(user.password);
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.json({
          error: "Wrong password",
        });
      }
      // 3. create jwt tokens
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "1d",
      });
      tokenAndUserResponse(req,res,user);
    } catch (err) {
      console.log(err);
      res.json({ error: "Something went wrong. Try again." });
    }
  };

  // export const forgotPassword= async (req,res)=>{
  //   try{
  //     const {email}=req.body;

  //     const user =await User.findOne({email});
  //     if(!user){
  //       return res.json({error:"Could not find user with that email"})
  //     }else{
  //       const resetCode=nanoid(); 
  //       user.resetCode=resetCode;
  //       user.save();

  //       const token=jwt.sign({resetCode},config.JWT_SECRET,{
  //         expiresIn:"1h",
  //       })

  //       config.AWSSES.sendEmail(emailTemplate(email,
  //         `<p>Please click the link below to access your account</p>
  //         <a href="${config.CLIENT_URL}/auth/access-account/${token}">Access your account</a>`

  //         ,config.REPLY_TO,'Access your account'),
  //       (err, data) => {
  //         if (err) {
  //             console.log(err);
  //             return res.json({ ok: false })
  //         }
  //         else {
  //             console.log(data);
  //             return res.json({ ok: true })
  //         }})
  //     }
  //   }
  //   catch(err)
  //   {
  //     console.log(err);
  //     return res.json({error:"Something went wrong"})
  //   }
  // }

  // export const accessAccount=async(req,res)=>{
  //   try {
  //     const {resetCode}=jwt.verify(req.body.resetCode.config.JWT_SECRET);
  //     const user=await User.findOneAndUpdate({resetCode},{resetCode:""});

  //    tokenAndUserResponse(req,res,user);

      
  //   } catch (err) {
  //     console.log(err);
  //     return res.json({error:"Something went wrong"})
  //   }
  // }

  export const refreshToken=async(req,res)=>{
    try {
      const {_id}=jwt.verify(req.headers.refresh_token,JWT_SECRET)

      const user =await User.findById(_id);

      tokenAndUserResponse(req,res,user);
      
    } catch (err) {
      console.log(err);
      return res.status(403).json({error:"Refresh token failed"});
      
    }
  }

  export const currentUser = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      user.password = undefined;
      user.resetCode = undefined;
      res.json(user);
    } catch (err) {
      console.log(err);
      return res.status(403).json({ error: "Unauthorized" });
    }
  };

  export const publicProfile=async(req,res)=>{
    try {
      const user=await User.findOne({username:req.params.username});
      user.password = undefined;
      user.resetCode = undefined;
      res.json(user); 
    } catch (err) {
      console.log(err);
      return res.json({error:"User not found"});
      
    }
  }

  export const updatePassword = async (req, res) => {
    try {
      const {password}=req.body;
      if(!password)
      {
        return res.json({error:"Password is required"});
      }
      if(password && password?.length<6)
      {
        return res.json({error:"Password should be min 6 char"});
      }
      const user =await User.findByIdAndUpdate(req.user._id,{
        password:await hashPassword(password),
      });
      res.json({ok:true});
    } catch (err) {
      console.log(err);
      return res.status(403).json({ error: "Unauthorized" });
    }
  };

  export const updateProfile = async (req, res) => {
    try {
      const user=await User.findByIdAndUpdate(req.user._id,req.body,{new:true});
      user.password=undefined;
      user.resetCode=undefined;
      res.json(user);
    } catch (err) {
      console.log(err);
      if(err.codeName==='DuplicateKey'){
        return res.json({error:"Username or email is already Taken"})
      }
      else {
        return res.status(403).json({ error: "Unauthorized" });
      }

      
    }
  };

  export const agents =async(req,res)=>{
    try {
      const agents=await User.find({role:"Seller"}).select('-password -role -enquiredProperties -wishlist -photo.Key -photo.Bucket')
      res.json(agents);
    } catch (err) {
      console.log(err);
      
    }
  }

  export const agentAdCount =async(req,res)=>{
    try {
      const ads=await Ad.find({postedBy:req.params._id}).select("_id");
      res.json(ads);
    } catch (err) {
      console.log(err);
    }
  }
  export const agent =async(req,res)=>{
    try {
      const user=await User.findOne({username:req.params.username}).select('-password -role -enquiredProperties -wishlist -photo.Key -photo.Bucket');
      const ads=await Ad.find({postedBy:user._id}).select("-photos.key -photos.Key -photos.Etag -location -googleMap")
      res.json({user,ads})
    } catch (err) {
      console.log(err);
      
    }
  }