import { memo } from "react";
import React from 'react'
import PastEvents from "@/components/sections/PastEvents";

const PastEventsPage = () => {
  return (
    <PastEvents viewSlider={false} hideViewAll={false}/>
  )
}

PastEventsPage.displayName = "PastEventsPage";
export default PastEventsPage

