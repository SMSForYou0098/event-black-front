import HeaderDefault from '@/components/partials/HeaderDefault'
import HeaderSimple from '@/components/partials/HeaderSimple';
import { useRouter } from 'next/router';
import React from 'react'

const HeaderDecider = () => {
    const router = useRouter();
    
    // Define routes where menu should be visible
    const defaultHeaderRoutes = [
        '/',
        '/events',
        '/profile',
        '/event-details',
        '/about-us',
        '/blogs',
        // Add more routes as needed
    ];

    // Check if current route should show menu (including nested routes)
    const shouldShowDefaultMenu = defaultHeaderRoutes.some(route => {
        if (route === '/') {
            return router.pathname === '/'; // Exact match for home
        }
        return router.pathname.startsWith(route);
    });

    if (shouldShowDefaultMenu) {
        return (
            <div>
                <HeaderDefault />
            </div>
        )
    } else {
        return <div className="d-block d-sm-none"><HeaderSimple /></div>;
    }
}

export default HeaderDecider