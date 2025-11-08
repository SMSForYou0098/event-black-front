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
      <main className={`main-content ${!isHomePage ? 'section-padding' : 'pt-5'}`}>
        <BreadCrumbWidget />
        {/* <HeaderDecider /> */}
        <HeaderProvider>
          {children}
        </HeaderProvider>
      </main>
      <div className="d-block d-lg-none" style={{ marginTop: "5rem" }}>
  <MobileBottomMenu />
</div>

{/* Show on large screens (lg and up) */}
<div className="d-none d-lg-block">
  <FooterDefault />
</div>
      {/* <StickyContent /> */}
      {/* <SettingOffCanvas /> */}
    </>
  )
})

export default Frontend