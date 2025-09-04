import React, { useEffect, useState } from "react";


// header
import HeaderDefault from "../components/partials/HeaderDefault";

// footer
import FooterDefault from "../components/partials/FooterDefault";

//breadcrumb
import BreadCrumbWidget from "@/components/BreadcrumbWidget";

//seetingoffCanvas
import SettingOffCanvas from "../components/setting/SettingOffCanvas";

import StickyContent from "../utils/StickyContent";
const Frontend = (({ children }) => {

  return (
    <>
      <main className="main-content">
        <BreadCrumbWidget />
        <HeaderDefault />

        {children}
      </main>
      <FooterDefault />
      <StickyContent />
      <SettingOffCanvas />
    </>
  )
})

export default Frontend