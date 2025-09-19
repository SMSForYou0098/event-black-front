import React from 'react'
import { useMyContext } from "@/Context/MyContextProvider"; //done
import { useRouter } from 'next/router';

const EventsByCategory = () => {
    const {convertSlugToTitle} = useMyContext();
    const router = useRouter();
    const {category_name} = router.query;

  return (
    <div className='mt-5 pt-5'>EventsByCategory{convertSlugToTitle(category_name)}</div>
  )
}

export default EventsByCategory