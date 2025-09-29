import React from "react";
// footer
import FooterDefault from "../components/partials/FooterDefault";
import MobileBottomMenu from "../components/partials/MobileBottonMenu";

//breadcrumb
import BreadCrumbWidget from "@/components/BreadcrumbWidget";

//seetingoffCanvas
import SettingOffCanvas from "../components/setting/SettingOffCanvas";

import StickyContent from "../utils/StickyContent";
import HeaderDecider from "./HeaderDecider";
import { HeaderProvider } from "@/context/HeaderContext";
const Frontend = (({ children }) => {
  return (
    <>
      <main className="main-content">
        <BreadCrumbWidget />
        {/* <HeaderDecider /> */}
        <HeaderProvider>
          {children}
        </HeaderProvider>
      </main>
      <div className="d-none d-sm-block">
        <FooterDefault />
      </div>
      <div className="d-block d-sm-none">
        <MobileBottomMenu />
      </div>
      <StickyContent />
      <SettingOffCanvas />
    </>
  )
})

export default Frontend