import { Loader } from 'lucide-react';
import dynamic from 'next/dynamic';

const BookingSeatCanvas = dynamic(
    () => import('./Bookingseatcanvas'),
    {
        ssr: false,
        loading: () => (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <img
                    src="/assets/stock/loader111.gif"
                    alt="Loading..."
                    style={{ width: '100px', height: '100px' }}
                />
            </div>
        )
    }
);

export default BookingSeatCanvas;