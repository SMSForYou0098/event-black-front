import React, { useEffect } from 'react'
import { getuserBookings } from '../../services/events'
import { useMyContext } from "@/Context/MyContextProvider";
import { useQuery } from '@tanstack/react-query';

const Bookings = () => {
    const {UserData} = useMyContext()
const {
    data: bookings,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['userBookings', UserData?.id],
    queryFn: () => getuserBookings(UserData?.id),
    enabled: !!UserData?.id, // Prevents query if user is not logged in
    retry: 2 // Optional: retry failed requests 2 times
  })

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <span className="text-base font-medium">Loading bookings...</span>
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="py-6 text-center text-red-500">
        <span>Error: {error?.message || 'Failed to fetch bookings.'}</span>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={refetch}>
          Retry
        </button>
      </div>
    )
  }
  return (
    <div className=''>
    </div>
  )
}

export default Bookings
