import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { ChevronRight, MessageSquare, FileText, Lock, LogOut, Ticket } from 'lucide-react';
import CustomDrawer from '@/utils/CustomDrawer';
import AvatarImage from '@/utils/ProfileUtils/AvatarImage';
import Link from 'next/link';
import { useRouter } from 'next/router';

const UserProfileDrawer = ({ show, onHide, userData, onLogout }) => {
    const router = useRouter();

    const MenuItem = ({ icon: Icon, label, onClick, href, className = "" }) => (
        <div
            className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 cursor-pointer ${className}`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            onClick={() => {
                if (onClick) onClick();
                if (href) router.push(href);
                onHide();
            }}
        >
            <div className="d-flex align-items-center gap-3">
                {Icon && <Icon size={20} className="text-muted" />}
                <span className="fw-medium">{label}</span>
            </div>
            <ChevronRight size={18} className="text-muted" />
        </div>
    );

    return (
        <CustomDrawer
            showOffcanvas={show}
            setShowOffcanvas={onHide}
            title=""
            className="user-profile-drawer"
            hideIndicator={true}
        >
            <div className="d-flex flex-column h-100">

                {/* Profile Header */}
                <div className="d-flex align-items-center gap-3 mb-4 px-2">
                    <AvatarImage
                        src={userData?.photo}
                        alt="Profile"
                        name={userData?.name}
                        size={60}
                    />
                    <div>
                        <h5 className="mb-0 fw-bold text-capitalize">{userData?.name || 'User'}</h5>
                        <small className="text-muted">{userData?.phone_number || userData?.email}</small>
                    </div>
                </div>

                {/* View All Bookings - Prominent */}
                <MenuItem
                    icon={Ticket}
                    label="View all bookings"
                    href="/bookings"
                />

                {/* Support Section */}
                <div className="mt-4">
                    <h6 className="fw-bold mb-3 px-2">Support</h6>
                    <MenuItem
                        icon={MessageSquare}
                        label="Chat with us"
                        onClick={() => window.open('https://wa.me/919737227359', '_blank')}
                    />
                </div>

                {/* More Section */}
                <div className="mt-4">
                    <h6 className="fw-bold mb-3 px-2">More</h6>
                    <MenuItem
                        icon={FileText}
                        label="Terms & Conditions"
                        href="/terms-and-conditions"
                    />
                    <MenuItem
                        icon={Lock}
                        label="Privacy Policy"
                        href="/privacy-policy"
                    />
                </div>

                {/* Logout Section */}
                <div className="mt-auto pb-3">
                    <div
                        className="d-flex align-items-center gap-3 p-3 rounded-3 cursor-pointer"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => {
                            onLogout();
                            onHide();
                        }}
                    >
                        <LogOut size={20} className="text-danger" />
                        <span className="fw-medium text-danger">Logout</span>
                    </div>
                </div>

            </div>
        </CustomDrawer>
    );
};

export default UserProfileDrawer;
