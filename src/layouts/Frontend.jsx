import React, { useEffect, useState } from "react";


// header
import HeaderDefault from "../components/partials/HeaderDefault";

// footer
import FooterDefault from "../components/partials/FooterDefault";
import MobileBottomMenu from "../components/partials/MobileBottonMenu";

//breadcrumb
import BreadCrumbWidget from "@/components/BreadcrumbWidget";

//seetingoffCanvas
import SettingOffCanvas from "../components/setting/SettingOffCanvas";

import StickyContent from "../utils/StickyContent";
import { useMyContext } from "@/Context/MyContextProvider";
const Frontend = (({ children }) => {
const {isMobile, isTablet} = useMyContext();
  return (
    <>
      <main className="main-content">
        <BreadCrumbWidget />
        <HeaderDefault />

        {children}
      </main>

      {isMobile || isTablet ? <MobileBottomMenu /> : <FooterDefault />}
      <StickyContent />
      <SettingOffCanvas />
    </>
  )
})

export default Frontend