import {useState,useEffect} from 'react'
import { useAuth } from '../../context/auth'
import {Link,useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
export default function ContactSeller({ad}){
    //context
    const [auth,setAuth]=useAuth();

    //state
    const[name,setName]=useState("");
    const[email,setEmail]=useState("");
    const[message,setMessage]=useState("");
    const[phone,setPhone]=useState("");
    const[loading,setLoading]=useState("");

    //hooks
    const navigate=useNavigate();

    const loggedIn=auth.user!==null && auth.token !=="";
    useEffect(()=>{
        if(auth?.user){
            setName(auth.user?.name)
            setEmail(auth.user?.email)
            setPhone(auth.user?.phone)
        }

    },[loggedIn])

    const handleSubmit=async (e)=> {
        e.preventDefault();
        setLoading(true);
        try {
            const {data}= await axios.post("/contact-seller",{
                name,
                email,
                message,
                phone,
                adId:ad._id,
            });
            if(data?.error)
            {
                toast.error(data?.error);
                setLoading(false);
            }
            else
            {
            setLoading(true)
            toast.success("Your enquiry has been mailed to the seller .")
            setMessage("");
            setLoading(false)
            }
        } catch (err) {
            console.log(err);
            setLoading(false)
            toast.error('Something went wrong.Try Again !!!')
        }
    }

    return<>
    <div className="row">
        <div className="col-lg-8 offset-lg-2">
            <h3>
                Contact{" "} {ad?.postedBy?.name ? ad?.postedBy?.name : ad?.postedBy?.username } 
            </h3>

            <form >
                <textarea 
                name="message" 
                className='form-control'
                placeholder='Write Your Message'
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                autoFocus={true}
                disabled={!loggedIn}
                >

                </textarea>

                <input type="text" 
                className='form-control mb-3'
                placeholder='Enter your Name'
                value={name}
                onChange={(e)=>setName(e.target.value)}
                disabled={!loggedIn}
                />

                <input type="text" 
                className='form-control mb-3'
                value={email}
                placeholder='Enter your Email'
                onChange={(e)=>setEmail(e.target.value)}
                disabled={!loggedIn}
                />

                <input type="text" 
                className='form-control mb-3'
                placeholder='Enter your Phone Number'
                value={phone}
                onChange={(e)=>setPhone(e.target.value)}
                disabled={!loggedIn}
                />

                <button
                onClick={handleSubmit}
                className='btn btn-primary mb-3 mt-4'
                disabled={!name || !email || loading}>
                    {loggedIn ? loading ? "Please Wait" : "Send Enquiry" :"Login To send Enquiry"}
                </button>


            </form>
        </div>
    </div>


    </>
}