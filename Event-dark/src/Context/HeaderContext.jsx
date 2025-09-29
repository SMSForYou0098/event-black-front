import React, { createContext, useContext, useEffect, useState } from 'react';
import HeaderSimple from '@/components/partials/HeaderSimple';
import HeaderDefault from '@/components/partials/HeaderDefault';
import { useRouter } from 'next/router';
const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState(null);
  const router = useRouter();
  // Define routes where menu should be visible
  // const defaultHeaderRoutes = [
  //   {
  //     path: '/',
  //     exact: true
  //   },
  //   {
  //     path: '/events',
  //     nested: true // This will match all routes starting with /events
  //   },
  //   {
  //     path: '/profile',
  //     nested: true // This will match /profile and its nested routes
  //   },
  //   {
  //     path: '/about-us',
  //     exact: true // This will only match exact /about-us
  //   },
  //   {
  //     path: '/blogs',
  //     exact: true
  //   },
  //   {
  //     path: '/faq',
  //     exact: true
  //   }
  // ];

  // // Check if current route should show menu
  // const shouldShowDefaultMenu = defaultHeaderRoutes.some(route => {
  //   if (route.exact) {
  //     return route.path === router.pathname;
  //   }
  //   if (route.nested) {
  //     return router.pathname.startsWith(route.path);
  //   }
  //   return false;
  // });
  // console.log(shouldShowDefaultMenu, router.pathname);
  return (
    <HeaderContext.Provider value={setHeaderConfig}>
      <div className="d-none d-sm-block">
        <HeaderDefault />
      </div>
      {/* {shouldShowDefaultMenu &&
      } */}
      <div className="d-block d-sm-none">
        {headerConfig ?
          <HeaderSimple {...headerConfig} />
          : <HeaderDefault />
        }
      </div>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeaderSimple = (props) => {
  const setHeaderConfig = useContext(HeaderContext);

  useEffect(() => {
    if (props) {
      setHeaderConfig(props);
    }

    return () => setHeaderConfig(null);
  }, [props, setHeaderConfig]);
};