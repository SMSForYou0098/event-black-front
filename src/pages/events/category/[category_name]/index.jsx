import React, { useEffect } from 'react'
import { useMyContext } from "@/Context/MyContextProvider"; //done
import { useRouter } from 'next/router';
import {api} from '@/lib/axiosInterceptor';
const EventsByCategory = () => {
    const {convertSlugToTitle} = useMyContext();
    const router = useRouter();
    const {category_name} = router.query;

    const GetCategoryData = async (category_name) => {
      console.log("Fetching data for category:", category_name);
        try {
            const response = await api.get(`/category-events/${category_name}`);
            console.log("Category Data:", response.data);
            // Handle the response data as needed
        } catch (error) {
            console.error("Error fetching category data:", error);
        } 
    };

    useEffect(() => {
        if (category_name) {
            GetCategoryData(category_name);
        }
    }, [category_name]);
     

  return (
    <div className='mt-5 pt-5'>EventsByCategory{convertSlugToTitle(category_name)}</div>
  )
}

export default EventsByCategory