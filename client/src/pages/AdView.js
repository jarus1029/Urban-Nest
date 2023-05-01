import { useParams } from "react-router-dom"
import { useEffect,useState ,useCallback} from "react";
import axios from "axios"
import ImageGallery  from "../components/misc/ImageGallery";
import Logo from '../Logo.png'
import AdFeatures from '../components/cards/AdFeatures'
import { formatNumber } from "../helpers/ad";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import LikeUnlike from "../components/misc/LikeUnlike";
import MapCard from "../components/cards/MapCard";
import HTMLRenderer from 'react-html-renderer'
import AdCard from '../components/cards/AdCard'
import ContactSeller from "../components/forms/ContactSeller";
dayjs.extend(relativeTime);//form now() 4 hours ago

export default function AdView(){

    //state
    const [ad,setAd]=useState({});
    const [related,setRelated]=useState([]);

    //hooks
    const params=useParams();

    useEffect(() => {
        if (params?.slug) fetchAd();
      }, [params?.slug]);

      const fetchAd = async () => {
        try {
          const { data } = await axios.get(`/ad/${params.slug}`);
          setAd(data?.ad);
          setRelated(data?.related);
        } catch (err) {
          console.log(err);
        }
      };

      const generatePhotosArray=(photos)=>{
        if(photos?.length>0){
            const x=photos?.length===1 ? 2:4;
            let arr=[];
            photos.map((p)=>
                arr.push({
                    src:p.Location,
                    width:x,
                    height:x,
                })
            );
            return arr;
        }
        else
        {
            return [{
                src:Logo,
                width:2,
                height:1
            }]
        }
    }

     
    return(
        <>
        <div className="container-fluid">
          <div className="row mt-2">
            <div className="col-lg-4">
              <div className="d-flex justify-content-between">
              <button className="btn btn-primary mt-2">{ad.type} for {ad.action}</button>
              <LikeUnlike ad={ad}/>
              </div>
              <div className="mt-4 mb-4">
              {ad?.sold?"❌Off Market":"✅In Market"}
              </div>
              <h1>{ad.address}</h1>
              <AdFeatures ad={ad}/>
              <h3 className="mt-3 h2">₹{formatNumber(ad.price)}</h3>
              <p className="text-muted">{dayjs(ad?.createdAt).fromNow()}</p>
            </div>
            <div className="col-lg-8">
              <ImageGallery photos={generatePhotosArray(ad?.photos)}/>
              
            </div>
          </div>
        </div>
        <div className="container mb-5">
          <div className="row">
            <div className="col-lg-8 offset-lg-2 mt-3">
              <MapCard ad={ad}/>

              <br />
              <h1>
                {ad?.type} in {ad?.address} for {ad?.action} ₹{ad?.price}
              </h1>

              <AdFeatures ad={ad}/>

              <hr />

              <h3 >{ad?.title}</h3>
              <HTMLRenderer
              html={ad?.description?.replaceAll(".","<br/><br/>")}/>

            </div>
          </div>
        </div>
        <div className="container">
          <ContactSeller ad={ad}/>
        </div>
        <div className="container-fluid">
            <h4 className="text-center mb-3">
              Related Properties
              <hr />
            </h4>
          <div className="row">
            {related?.map(ad=><AdCard key={ad._id} ad={ad} />)}
          </div>
        </div>
        </>
    )
}