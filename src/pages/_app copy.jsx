import { useState } from 'react';
import 'swiper/css'
import "swiper/css/navigation";
import "swiper/css/pagination";
import '../styles/global.scss'
import "sweetalert2/src/sweetalert2.scss";

// TanStack Query Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import AppLayout from "@/layouts/App";
import Frontend from "@/layouts/Frontend";
import Blank from '@/layouts/blank';
import Merchandise from '@/layouts/MerchandiseLayout';

//store
import { Provider } from 'react-redux';
//reducer
import { wrapperStore } from '@/store'
import { PersistGate } from 'redux-persist/integration/react';
import AppContent from '@/lib/AppContent';
import { MyContextProvider } from '@/Context/MyContextProvider';
import { Toaster } from 'react-hot-toast';

const layouts = {
  "Blank": Blank,
  "Frontend": Frontend,
  "Merchandise": Merchandise
};

export default function App({ Component, ...rest }) {
  const layoutName = layouts[Component.layout] || layouts['Frontend']
  const Layout = layoutName || ((children) => <>{children}</>);
  const { store, props } = wrapperStore.useWrappedStore(rest);
  const { pageProps } = props;

  // Create a client instance once per application lifecycle.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    // Provide the query client to your entire app
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={store.__persistor}>
          <MyContextProvider>
            <AppLayout>
              <AppContent>
                <Layout>
                  <Toaster />
                  <Component {...pageProps} />
                </Layout>
              </AppContent>
            </AppLayout>
          </MyContextProvider>
        </PersistGate>
      </Provider>

      {/* The Devtools are great for debugging! */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}