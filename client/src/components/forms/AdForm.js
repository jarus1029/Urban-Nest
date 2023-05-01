import {useState} from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
// import { GOOGLE_PLACES_KEY } from '../../config';
import CurrencyInput from 'react-currency-input-field';
import ImageUpload from './ImageUpload';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/auth';


export default function AdForm ({action,type}) {
    const navigate=useNavigate();
    const [auth,setAuth]=useAuth();

    const [ad,setAd]=useState({
        photos:[],
        uploading:false,
        price:'',
        address:'',
        bedrooms:'',
        bathrooms:'',
        carparks:'',
        landsize:'',
        title:'',
        description:'',
        loading:false,
        type,
        action,
    });

    const handleClick=async()=>{
        try {
            setAd({...ad,loading:true})
            const {data}=await axios.post('/ad',ad)
            console.log('adcreate response =>',data);
            if(data?.error){
                toast.error(data.error);
                setAd({...ad,loading:false});
            }else{

                // update context
                setAuth({...auth,user:data.user});

                const fromLS=JSON.parse(localStorage.getItem('auth'))

                fromLS.user=data.user;
                localStorage.setItem('auth',JSON.stringify(fromLS));

                //update user in local storahe
                toast.success("Ad created Successfully");
                setAd({...ad,loading:false});
                //reload page on 
                window.location.href="/dashboard";
            }
        } catch (err) {
            console.log(err);
            setAd({...ad,loading:false});
        }
    }



    return(
        <>
        <div className='mb-3 form-control'>
            <ImageUpload ad={ad} setAd={setAd}/>
            <GooglePlacesAutocomplete
            apiKey={process.env.REACT_APP_GOOGLE_PLACES_KEY}
            apiOptions="in"
            selectProps={{
                defaultInputValue:ad?.address,
                placeholder:"Search for address",
                onChange:({value})=>{
                    setAd({...ad,address:value.description});
                }
            }}/>
        </div>

        <div style={{marginTop:"80px"}}>
        <CurrencyInput 
        placeholder='Enter Price' 
        defaultValue={ad.price}
        className='mb-3 form-control'
        onValueChange={(value)=>setAd({...ad, price:value})}
        />
        </div>

        {type==="House" ? (
            <>
            <input 
        type="number"
        min="0"
        className='form-control mb-3'
        placeholder='Enter how many bedrooms'
        value={ad.bedrooms}
        onChange={(e)=>setAd({...ad,bedrooms:e.target.value})}/>

        <input 
        type="number"
        min="0"
        className='form-control mb-3'
        placeholder='Enter how many bathrooms'
        value={ad.bathrooms}
        onChange={(e)=>setAd({...ad,bathrooms:e.target.value})}/>

        <input 
        type="number"
        min="0"
        className='form-control mb-3'
        placeholder='Enter how many carparks'
        value={ad.carparks}
        onChange={(e)=>setAd({...ad,carparks:e.target.value})}/>
            </>
        ):""}

       <input 
        type="text"
        className='form-control mb-3'
        placeholder='Enter size of the land'
        value={ad.landsize}
        onChange={(e)=>setAd({...ad,landsize:e.target.value})}/>

        <input
        type="text"
        className='form-control mb-3'
        placeholder='Enter Title'
        value={ad.title}
        onChange={(e)=>setAd({...ad,title:e.target.value})}/>

        <textarea
        className='form-control mb-3'
        placeholder='Enter Description'
        value={ad.description}
        onChange={(e)=>setAd({...ad,description:e.target.value})}/>

        <button onClick={handleClick}className={`btn btn-primary ${ad.loading ? "disabled" : ""} mb-5`}>{ad.loading ? "Saving ..." :"Submit"}</button>
        {/* <pre>
            {JSON.stringify(ad,null,4)}
        </pre> */}
        </>
    )
}