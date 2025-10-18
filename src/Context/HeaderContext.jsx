import React, { createContext, useContext, useEffect, useState } from 'react';
import HeaderSimple from '@/components/partials/HeaderSimple';
import HeaderDefault from '@/components/partials/HeaderDefault';
import { useRouter } from 'next/router';
const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState(null);
  const router = useRouter();
  return (
    <HeaderContext.Provider value={setHeaderConfig}>
      <div className="d-none d-sm-block">
        <HeaderDefault />
      </div>
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