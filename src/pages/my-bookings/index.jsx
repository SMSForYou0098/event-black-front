import React from 'react'
import BookingsTab from '../../components/events/Profile/BookingsTab'
import { useQuery } from '@tanstack/react-query';
import { useMyContext } from '@/Context/MyContextProvider';
import { api } from "@/lib/axiosInterceptor";

const MyBookings = () => {
  const { UserData, ErrorAlert } = useMyContext();

  const fetchUserBookings = async (id) => {
    const res = await api.get(`/user-bookings/${id}`);
    return res.data;
  };
  const {
    data: userBookings,
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
    error: bookingsError,
    refetch: refetchBookings,
    isFetching: isFetchingBookings,
  } = useQuery({
    queryKey: ["userBookings", UserData?.id],
    queryFn: ({ queryKey }) => fetchUserBookings(queryKey[1]),
    enabled: !!UserData?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  return (
    <div>
        <BookingsTab bookings={userBookings?.bookings} userBookings={userBookings?.bookings ?? userBookings ?? []} loading={isLoadingBookings} />
    </div>
  )
}

export default MyBookings