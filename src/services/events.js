
import { api, publicApi } from "@/lib/axiosInterceptor";



export const getEventById = async(id) =>{
    console.log('id',id)
    const response = await publicApi.get(`/event-detail/${id}`);
    return response.data
}