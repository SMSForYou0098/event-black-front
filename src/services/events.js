
import {api,  publicApi } from "@/lib/axiosInterceptor";



export const getEventById = async(id) =>{
    const response = await publicApi.get(`/event-detail/${id}`);
    return response.data
}


export const getuserBookings = async(id)=>{
    const response = await api.get(`/user-bookings/${id}`);
    return response.data
}