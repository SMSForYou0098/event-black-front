import React, { createContext, useContext, useEffect, useState } from 'react';
import HeaderSimple from '@/components/partials/HeaderSimple';
import HeaderDefault from '@/components/partials/HeaderDefault';
const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState(null);

  return (
    <HeaderContext.Provider value={setHeaderConfig}>
      {headerConfig &&
        <>
          <div className="d-block d-sm-none"><HeaderSimple {...headerConfig} /></div>
          <div className="d-none d-sm-block">
            <HeaderDefault />
          </div>
        </>
      }
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