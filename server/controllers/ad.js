// import * as config from "../config.js";
import { nanoid } from "nanoid";
import slugify from "slugify"
import Ad from "../models/ad.js"
import User from '../models/user.js'
import { emailTemplate } from "../helpers/email.js";
import S3 from 'aws-sdk/clients/s3.js'
import SES from 'aws-sdk/clients/ses.js'
import * as dotenv from 'dotenv'
dotenv.config();
import NodeGeocoder from 'node-geocoder';

const CLIENT_URL="http://localhost:3000";

const awsConfig={
  accessKeyId:process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
  region:"eu-north-1",
  apiVersion:"2010-12-01", 
}
const AWSSES=new SES(awsConfig)
const AWSS3=new S3(awsConfig)
const options = {
  provider: 'google',
  apiKey: process.env.API_KEY,
  formatter: null 
};
const GOOGLE_GEOCODER=NodeGeocoder(options)
const JWT_SECRET=process.env.JWT_SECRET;

export const uploadImage = async (req, res) => {
  try {
    // console.log(req.body);
    const { image } = req.body;

    const base64Image = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = image.split(";")[0].split("/")[1];

    // image params
    const params = {
      Bucket: "urbannest",
      Key: `${nanoid()}.${type}`,
      Body: base64Image,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    AWSS3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        // console.log(data);
        res.send(data);
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "Upload failed. Try again." });
  }
};

export const removeImage=(req,res)=>{
  try {
    const {Key,Bucket}=req.body;
    AWSS3.deleteObject({Bucket,Key},(err,data)=>{
      if(err){
        console.log(err);
        res.sendStatus(400);
      }else{
        res.send({ok:true})
      }
    })
  } catch (err) {
    console.log(err);
  }
}

export const create=async(req,res)=>{
  try {
    // console.log(req.body);
    const { photos,description,title,address,price,type,landsize }=req.body;
    if(!photos?.length){
      return res.json({error:"Photos are required"});
    }
    if(!price){
      return res.json({error:"Price are required"});
    }
    if(!type){
      return res.json({error:"Is property house or land"});
    }
    if(!address){
      return res.json({error:"Address is required"});
    }
    if(!description){
      return res.json({error:"Description is required"});
    }
    const geo=await GOOGLE_GEOCODER.geocode(address);
    // console.log(geo);

    const ad=await new Ad({
      ...req.body,
      postedBy:req.user._id,
      location:{
        type:'Point',
        coordinates:[geo?.[0]?.longitude,geo?.[0]?.latitude],
      },
      googleMap:geo,
      slug:slugify(`${type}-${address}-${price}-${nanoid(6)}`) 
    }).save();

    //make user role->seller
    const user=await User.findByIdAndUpdate(req.user._id,{
      $addToSet:{role:"Seller"},
    },{new:true})

    user.password=undefined;
    user.resetCode=undefined;
    res.json({
      ad,user,
    })

  } catch (err) {
    res.json({error:"Something went Wrong.Try Again !!!"})
    console.log(err);
    
  }
}

export const ads=async(req,res)=>{
  try {
    const adsForSell=await Ad.find({action:"Sell",}).select('-googleMap -location -photo.Key -photo.key -photo.Etag').sort({createdAt:-1})
    .limit(12);
    
    const adsForRent=await Ad.find({action:"Rent",}).select('-googleMap -location -photo.Key -photo.key -photo.Etag').sort({createdAt:-1})
    .limit(12);

    res.json({adsForSell,adsForRent})
  } catch (err) {
    console.log(err);
    
  }
}
export const read=async(req,res)=>{
  try {
    const ad=await Ad.findOne({slug:req.params.slug}).populate(
      'postedBy',
      'name username email phone company photo.Location')
      
      // related
      const related=await Ad.find({
        _id:{$ne:ad._id},
        action:ad.action,
        type:ad.type,
        address:{
          $regex:ad.googleMap[0]?.city,
          $options:'i'
        },
      }).limit(3).select('-photos.Key -photos.key -photos.ETag -photos.Bucket -googleMap')
      res.json({ad,related});
  } catch (err) {
    console.log(err);

    
  }
}

export const addToWishList=async(req,res)=>{
try {
  const user=await User.findByIdAndUpdate(
    req.user._id,
    {
    $addToSet:{wishlist:req.body.adId}
    },
    {new:true}
  );

  const {password,resetCode,...rest}=user._doc;
  res.json(rest);
} catch (err) {
  console.log(err);
}
}

export const removeFromWishList=async(req,res)=>{
  try {
    const user=await User.findByIdAndUpdate(
      req.user._id,
      {
      $pull:{wishlist:req.params.adId}
      },
      {new:true}
    );
  
    const {password,resetCode,...rest}=user._doc;
    res.json(rest);
  } catch (err) {
    console.log(err);
  }
  }

  export const contactSeller=async(req,res)=>{
    try {
      const {name,email,message,phone,adId}=req.body;
      // console.log(req.body);
      const ad=await Ad.findById(adId).populate("postedBy","email");

      const user =await User.findByIdAndUpdate(req.user._id,{
        $addToSet:{enquiredProperties:adId}
      });

      if(!user){
        return res.json({error:"Could not find user with that email"})
      }else{
        //send emails
        AWSSES.sendEmail(
          emailTemplate(
              ad.postedBy.email,
              ` <p>You Have received a new customer enquiry</p>
              <h4>Customer Details</h4>
              <p>Name : ${name}</p>
              <p>Email : ${email}</p>
              <p>Phone Number : ${phone}</p>
              <p>Message : ${message}</p>
              <a href="${CLIENT_URL}/ad/${ad.slug}">$${ad.address} for ${ad.action} ${ad.price}</a>
              `,
              email,
              'New Enquiry Received'),
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
      }

    } catch (err) {
      console.log(err);
      
    }
  }

  export const userAds=async(req,res)=>{
    try {
      const perPage=3;
      const page=req.params.page ? req.params.page:1;

      const total=await Ad.find({postedBy:req.user._id})

      const ads=await Ad.find({postedBy:req.user._id})
      .select('-photos.Key -photos.key -photos.ETag -photos.Bucket -location -googleMap')
      .populate('postedBy','name email username phone company')
      .skip((page-1)*perPage)
      .limit(perPage)
      .sort({createdAt:-1});

      res.json({ads,total:total.length});
    } catch (err) {
      console.log(err);
    }
  }

  export const update = async (req, res) => {
    try {
      const { photos, price, type, address, description } = req.body;
  
      const ad = await Ad.findById(req.params._id);
  
      const owner = req.user._id == ad?.postedBy;
  
      if (!owner) {
        return res.json({ error: "Permission denied" });
      } else {
        // validation
        if (!photos.length) {
          return res.json({ error: "Photos are required" });
        }
        if (!price) {
          return res.json({ error: "Price is required" });
        }
        if (!type) {
          return res.json({ error: "Is property hour or land?" });
        }
        if (!address) {
          return res.json({ error: "Address is required" });
        }
        if (!description) {
          return res.json({ error: "Description are required" });
        }
  
        const geo = await GOOGLE_GEOCODER.geocode(address);

        await Ad.findByIdAndUpdate({_id:ad._id,},{
          ...req.body,
          slug: ad.slug,
          location: {
            type: "Point",
            coordinates: [geo?.[0]?.longitude, geo?.[0]?.latitude],
          },
        })
  
        res.json({ ok: true });
      }
    } catch (err) {
      console.log(err);
    }
  };

  export const enquiredProperties=async(req,res)=>{
    try {
      const user=await User.findById(req.user._id);
      const ads=await Ad.find({_id:user.enquiredProperties}).sort({createdAt:-1});
      res.json(ads);
    } catch (err) {
      console.log(err);
    }
  }

  export const wishlist=async(req,res)=>{
    try {
      const user=await User.findById(req.user._id);
      const ads=await Ad.find({_id:user.wishlist});
      res.json(ads);
    } catch (err) {
      console.log(err);
    }
  }

  export const remove=async(req,res)=>{
    try {
      const ad = await Ad.findById(req.params._id);
      const owner = req.user._id == ad?.postedBy;

      if(!owner){
        return res.json({error:"Permission Denied"})
      }else{
        await Ad.findByIdAndRemove(ad._id);
        res.json({ok:true});
        
      }
      
    } catch (err) {
      console.log(err);
    }
  }

  export const adsForSell=async(req,res)=>{
    try {
      const ads=await Ad.find({action:"Sell",}).select('-googleMap -location -photo.Key -photo.key -photo.Etag').sort({createdAt:-1})
      .limit(24);
  
      res.json(ads)
    } catch (err) {
      console.log(err);
      
    }
  }

  
  export const adsForRent=async(req,res)=>{
    try {
      const ads=await Ad.find({action:"Rent",}).select('-googleMap -location -photo.Key -photo.key -photo.Etag').sort({createdAt:-1})
      .limit(24);
      res.json(ads)
    } catch (err) {
      console.log(err);
      
    }
  }
  export const search=async(req,res)=>{
    try {
      // console.log('req query',req.query)
      const {action,address,type,priceRange}=req.query;
      const geo=await GOOGLE_GEOCODER.geocode(address);
      const ads=await Ad.find({
        action:action==="Buy"? "Sell":"Rent",
        type,
        price:{
          $gte:parseInt(priceRange[0]),
          $lte:parseInt(priceRange[1]),
        },
        location:{
          $near:{
            $maxDistance:50000,
            $geometry:{
              type:"Point",
              coordinates:[geo?.[0]?.longitude,geo?.[0]?.latitude]
            }
          }
        }
      }).limit(24).sort({createdAt:-1}).select('-photos.key -photos.Key, -photos.ETag -location -googleMap')
      res.json(ads);
    } catch (err){
      console.log(err);
    }
  }
  
