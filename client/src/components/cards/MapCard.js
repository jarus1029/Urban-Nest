import GoogleMapReact from 'google-map-react'
// import { GOOGLE_MAPS_KEY } from '../../config'
//77.561540,12.901950
export default function MapCard({ad}){
    const defaultProps={
        center:{
            lat:ad?.location?.coordinates[1],
            lng:ad?.location?.coordinates[0],
        },
        zoom:11
    }

    if(ad?.location?.coordinates?.length)
    {
        return(
        <div style={{width:'100%',height:'350px'}}>
        <GoogleMapReact
        bootstrapURLKeys={{ key:process.env.REACT_APP_GOOGLE_MAPS_KEY }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        >
            <div
                lat={ad?.location?.coordinates[1]}
                lng={ad?.location?.coordinates[0]}
                >
                    <span className="lead">
                        📍
                    </span>

            </div>
        </GoogleMapReact>
    </div>
    )
    };
}