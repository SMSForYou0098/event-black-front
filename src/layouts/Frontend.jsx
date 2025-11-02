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
import { HeaderProvider } from "@/Context/HeaderContext";
import { useRouter } from "next/router";
const Frontend = (({ children }) => {
  const router = useRouter();
  const isHomePage = router.pathname === '/' || router.pathname === '/home';
  return (
    <>
      <main className={`main-content ${!isHomePage ? 'section-padding' : ''}`}>
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
      {/* <SettingOffCanvas /> */}
    </>
  )
})

export default Frontend