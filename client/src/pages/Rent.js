import {useAuth} from "../context/auth";
import { useEffect,useState } from "react";
import axios from 'axios'
import AdCard from "../components/cards/AdCard";
import SearchForm from "../components/forms/SearchForm";

export default function Rent(){
    

    const [auth,setAuth]=useAuth();
    const[ads,setAds]=useState([]);

    useEffect(()=>{
        fetchAds();
    },[]);

    const fetchAds=async()=>{
        try {
            const {data}=await axios.get('/ads-for-rent');
            setAds(data);
        } catch (err) {
            console.log(err);
        }
    }
    //console.log(adsForSell);
    return (
        <div>
            <SearchForm/>
            <h1 className="display-1 bg-primary text-light p-5">For Rent</h1>
            <div className="container">
                <div className="row">
                    {ads?.map((ad)=>(
                        <AdCard ad={ad} key={ad._id}/>
                    ))}
                </div>
            </div>
            {/* <pre>
                {JSON.stringify({adsForSell,adsForRent},null,4)}
            </pre> */}
        </div>
    )
}