import { useParams,useNavigate } from "react-router-dom"
import { useEffect } from "react"
import toast  from "react-hot-toast";
import axios from 'axios'
import { useAuth } from "../../context/auth";


export default function AccountActivate(){
    //context
    const [auth,setAuth]=useAuth();
    const navigate=useNavigate();

    const {token}=useParams();
    // console.log(token);

    useEffect(()=>{
        if(token)
        requestActivation();
    },[token])

    const requestActivation=async()=>{
        try {
            const {data}=await axios.post(`/register`,{token});
            if(data?.error)
            {
                toast.error(data.error);
            }else{
                //save in localstorage
                localStorage.setItem('auth',JSON.stringify(data));
                //save in context
                setAuth(data);
                toast.success('Successfully logged in.Welcome to Urban Nest')
                navigate("/")
            }
            
        } catch (err) {
            console.log(err);
            toast.error("Something went wrong .Try Again")
            
        }
    }

    return <div className="display-1 d-flex justify-content-center align-items-center vh-100"
    style={{marginTop:"-5%"}}
    >
        Please Wait...
    </div>
}