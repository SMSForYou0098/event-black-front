// pages/_app.tsx
import { useState } from 'react';
import Head from 'next/head'; // ✅ Import Head
import { SessionProvider } from 'next-auth/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/global.scss';
import 'sweetalert2/src/sweetalert2.scss';

import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';

import AppLayout from '@/layouts/App';
import Frontend from '@/layouts/Frontend';
import Blank from '@/layouts/blank';

import { Provider } from 'react-redux';
import { store, persistor } from '@/store';
import { PersistGate } from 'redux-persist/integration/react';
import AppContent from '@/lib/AppContent';
import { MyContextProvider } from '@/Context/MyContextProvider';
import { Toaster } from 'react-hot-toast';

const layouts = { Blank, Frontend };

export default function App({
  Component,
  pageProps: { session, dehydratedState, ...pageProps },
}) {
  const Layout = layouts[Component.layout] || layouts.Frontend;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <>
      {/* ✅ Add viewport meta here */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <SessionProvider session={session}>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
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
          </SessionProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </>
  );
}
