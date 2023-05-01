import {useAuth} from "../context/auth";
import { useEffect,useState } from "react";
import axios from 'axios'
import UserCard from "../../src/components/cards/UserCard";

export default function Agents(){

    const [loading,setLoading]=useState(true);
    const [agents,setAgents]=useState();
    useEffect(()=>{
        fetchAgents();
    },[]);

    const fetchAgents=async()=>{
        try {
            const {data}=await axios.get('/agents');
            setAgents(data);
            setLoading(false)
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    }
    //console.log(adsForSell);
    return (
        <div>
            <h1 className="display-1 bg-primary text-light p-5">Agents</h1>
            <div className="container">
                <div className="row">
                    {agents?.map((agent)=>(
                        <UserCard user={agent} key={agent._id}/>
                    ))}
                </div>
            </div>
            
            {/* <pre>
                {JSON.stringify({adsForSell,adsForRent},null,4)}
            </pre> */}
        </div>
    )
}