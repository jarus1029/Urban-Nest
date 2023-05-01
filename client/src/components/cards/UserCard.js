import { Badge } from 'antd'
import { Link } from 'react-router-dom'
import Pro from '../../Pro.png'
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime"
import { useState,useEffect } from 'react';
import axios from 'axios'
dayjs.extend(relativeTime);//form now() 4 hours ago
export default function UserCard({ user }) {

    const [count,setCount]=useState(0);
    useEffect(()=>{
        if(user?._id)
        fetchAdCount();
    },[user?._id])

    const fetchAdCount=async()=>{
        try {
            const {data}=await axios.get(`/agent-ad-count/${user._id}`)
            setCount(data.length);
        } catch (err) {
            console.log(err)   
        }
    }
    return (

        <div className="col-lg-4 p-4 gx-4 gy-4">
            <Link to={`/agent/${user.username}`}>
                <Badge.Ribbon text={`${count} listings`}>
                    <div className="card hoverable shadow">
                        <img
                            src={user?.photo?.Location ?? Pro} 
                            alt={user.username}
                            style={{ height: "250px", ObjectFit: "cover" }}
                        />

                        <div className="card-body">
                            <h3>{user?.username ?? user?.name}</h3>
                            <p className='card-text'>Joined {dayjs(user.createdAt).fromNow()}</p>
                        </div>
                    </div>
                </Badge.Ribbon>

            </Link>
        </div >
    )
}