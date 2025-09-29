import React, { useEffect } from "react";

// Redux Selector / Action
import { useDispatch } from 'react-redux';

interface LayoutProps {
    children: React.ReactNode;
}

const AppLayout = ({ children }: LayoutProps) => {
    return <>{children}</>;
};
export default AppLayout;