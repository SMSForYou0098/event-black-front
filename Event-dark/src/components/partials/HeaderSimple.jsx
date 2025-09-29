import React, { memo, useEffect, useState } from "react";
import { Navbar, Container } from "react-bootstrap";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/router";
import Image from "next/image";

const HeaderSimple = memo(({ title = "", logoSrc = "" }) => {
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push("/");
  };

  // Add sticky functionality with state management
  useEffect(() => {
    const handleScroll = () => {
      const shouldBeSticky = window.scrollY > 1;
      setIsSticky(shouldBeSticky);
      
      // Update all header elements with sticky class
      const headerStickies = document.querySelectorAll(".header-sticky");
      headerStickies.forEach(header => {
        if (shouldBeSticky) {
          header.classList.add("sticky");
        } else {
          header.classList.remove("sticky");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    // Check initial scroll position
    handleScroll();

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Header content component to avoid duplication
  const HeaderContent = ({ isSticky }) => (
    <Container fluid className="navbar-inner py-2">
      <div className="d-flex align-items-center justify-content-between w-100">
        {/* Left: Back Button */}
        <button
          onClick={handleBack}
          className="btn btn-link p-0 text-body"
          aria-label="Back"
          style={{ minWidth: '44px', display: 'flex', justifyContent: 'center' }}
        >
          <ArrowLeft size={24} />
        </button>

        {/* Center: Title or Logo - Always render content */}
        <div className="d-flex align-items-center flex-grow-1">
          {logoSrc ? (
            <Image 
              height={isSticky ? 35 : 40} 
              width={isSticky ? 35 : 40} 
              src={logoSrc} 
              alt="Logo"
              className="mx-2"
              style={{ 
                transition: 'all 0.3s ease',
                opacity: 1
              }}
            />
          ) : (
            <h5 
              className={`mb-0 fw-bold`}
              style={{
                transition: 'all 0.3s ease',
                opacity: 1,
                display: 'block',
                visibility: 'visible'
              }}
            >
              {title}
            </h5>
          )}
        </div>

        {/* Right: Home Button */}
        <button
          onClick={handleHome}
          className="btn btn-link p-0 text-body"
          aria-label="Home"
          style={{ minWidth: '44px', display: 'flex', justifyContent: 'center' }}
        >
          <Home size={24} />
        </button>
      </div>
    </Container>
  );

  return (
    <header className="header-center-home header-default header-sticky">
      <Navbar className="nav navbar-light iq-navbar header-hover-menu py-xl-0">
        <HeaderContent isSticky={isSticky} />
      </Navbar>
    </header>
  );
});

HeaderSimple.displayName = "HeaderSimple";
export default HeaderSimple;