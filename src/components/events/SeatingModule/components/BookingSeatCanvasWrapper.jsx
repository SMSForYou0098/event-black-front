import { Loader } from 'lucide-react';
import dynamic from 'next/dynamic';

const BookingSeatCanvas = dynamic(
    () => import('./Bookingseatcanvas'),
    { 
        ssr: false,
        loading: () => (
            <Loader/>
        )
    }
);

export default BookingSeatCanvas;