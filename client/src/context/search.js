import {useState,createContext,useContext} from 'react'

const searchContext=createContext();

const initialState={
    address:'',
    action:"Buy",
    type:'House',
    price:"",
    priceRange:[0,1000000],
    results:[],
    page:'',
    loading:false,
}

const SearchProvider=({children})=>{
    const [search,setSearch]=useState(initialState);

    return(
        <searchContext.Provider value={[search,setSearch,initialState]}>
            {children}
        </searchContext.Provider>
    )
}

const useSearch=()=>useContext(searchContext);

export {useSearch,SearchProvider};