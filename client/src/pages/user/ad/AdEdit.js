import { useState, useEffect } from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
// import { GOOGLE_PLACES_KEY } from '../../../config';
import CurrencyInput from 'react-currency-input-field';
import ImageUpload from '../../../components/forms/ImageUpload';
import axios from 'axios';
import Sidebar from '../../../components/nav/Sidebar';
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdEdit({ action, type }) {
    const navigate = useNavigate();
    const params = useParams();
    useEffect(() => {
        if (params?.slug)
            fetchAd();
    }, [params?.slug])

    const fetchAd = async () => {
        try {
            const { data } = await axios.get(`/ad/${params.slug}`);
            // console.log("AD edit page:",data);
            setAd(data.ad);
            setLoaded(true);
        } catch (err) {
            console.log(err);
        }
    }

    const [ad, setAd] = useState({
        _id: "",
        photos: [],
        uploading: false,
        price: '',
        address: '',
        bedrooms: '',
        bathrooms: '',
        carparks: '',
        landsize: '',
        title: '',
        description: '',
        loading: false,
        type,
        action,
    });

    const [loaded, setLoaded] = useState(false);

    const handleClick = async () => {
        try {
            // setAd({...ad,loading:true})
            //validation
            if (!ad.photos?.length) {
                toast.error("Photo is required");
                return;
            }
            else if (!ad.price) {
                toast.error("Price is required");
                return;
            }
            else if (!ad.description) {
                toast.error("Description is required");
                return;
            }
            else {
                // make api put request
                setAd({ ...ad, loading: true })
                // console.log(ad);
                const { data } = await axios.put(`/ad/${ad._id}`, ad)
                // console.log('adcreate response =>',data);
                if (data?.error) {
                    toast.error(data.error);
                    setAd({ ...ad, loading: false });
                } else {
                    toast.success("Ad Updated Successfully");
                    // console.log(ad);
                    setAd({ ...ad });
                    navigate("/dashboard")
                }
            }
        } catch (err) {
            console.log(err);
            setAd({ ...ad, loading: false });
        }
    }
    const handleDelete = async () => {
        try {
            // make api put request
            setAd({ ...ad, loading: true })
            // console.log(ad);
            const { data } = await axios.delete(`/ad/${ad._id}`, ad)
            // console.log('adcreate response =>',data);
            if (data?.error) {
                toast.error(data.error);
                setAd({ ...ad, loading: false });
            } else {
                toast.success("Ad Deleted Successfully");
                // console.log(ad);
                setAd({ ...ad });
                navigate("/dashboard")
            }

        } catch (err) {
            console.log(err);
            setAd({ ...ad, loading: false });
        }
    }



    return (
        <div >
            <h1 className="display-1 bg-primary text-light p-5">Ad Edit</h1>
            <Sidebar />
            <div className='container'>
                <div className='mb-3 form-control'>
                    <ImageUpload ad={ad} setAd={setAd} />
                    {loaded ? (<GooglePlacesAutocomplete
                        apiKey={process.env.REACT_APP_GOOGLE_PLACES_KEY}
                        apiOptions="in"
                        selectProps={{
                            defaultInputValue: ad?.address,
                            placeholder: "Search for address",
                            onChange: ({ value }) => {
                                setAd({ ...ad, address: value.description });
                            }
                        }} />) : ("")}
                </div>

                {loaded ? (<div style={{ marginTop: "80px" }}>
                    <CurrencyInput
                        placeholder='Enter Price'
                        defaultValue={ad.price}
                        className='mb-3 form-control'
                        onValueChange={(value) => setAd({ ...ad, price: value })}
                    />
                </div>) : ("")}


                {ad.type === "House" ? (
                    <>
                        <input
                            type="number"
                            min="0"
                            className='form-control mb-3'
                            placeholder='Enter how many bedrooms'
                            value={ad.bedrooms}
                            onChange={(e) => setAd({ ...ad, bedrooms: e.target.value })} />

                        <input
                            type="number"
                            min="0"
                            className='form-control mb-3'
                            placeholder='Enter how many bathrooms'
                            value={ad.bathrooms}
                            onChange={(e) => setAd({ ...ad, bathrooms: e.target.value })} />

                        <input
                            type="number"
                            min="0"
                            className='form-control mb-3'
                            placeholder='Enter how many carparks'
                            value={ad.carparks}
                            onChange={(e) => setAd({ ...ad, carparks: e.target.value })} />
                    </>
                ) : ("")}

                <input
                    type="text"
                    className='form-control mb-3'
                    placeholder='Enter size of the land'
                    value={ad.landsize}
                    onChange={(e) => setAd({ ...ad, landsize: e.target.value })} />

                <input
                    type="text"
                    className='form-control mb-3'
                    placeholder='Enter Title'
                    value={ad.title}
                    onChange={(e) => setAd({ ...ad, title: e.target.value })} />

                <textarea
                    className='form-control mb-3'
                    placeholder='Enter Description'
                    value={ad.description}
                    onChange={(e) => setAd({ ...ad, description: e.target.value })} />

                <div className="d-flex justify-content-between">
                    <button onClick={handleClick} className={`btn btn-primary ${ad.loading ? "disabled" : ""} mb-5`}>{ad.loading ? "Saving ..." : "Submit"}</button>

                    <button onClick={handleDelete} className={`btn btn-danger ${ad.loading ? "disabled" : ""} mb-5`}>{ad.loading ? "Deleting ..." : "Delete"}</button>
                </div>
                {/* <pre>
            {JSON.stringify(ad,null,4)}
        </pre> */}
            </div>
        </div>
    )
}