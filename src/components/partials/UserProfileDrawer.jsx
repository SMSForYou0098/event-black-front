import React from 'react';
import {
    ChevronRight,
    MessageSquare,
    FileText,
    ShieldQuestionMark,
    Lock,
    LogOut,
    Ticket,
    User
} from 'lucide-react';
import CustomDrawer from '@/utils/CustomDrawer';
import AvatarImage from '@/utils/ProfileUtils/AvatarImage';
import CustomBtn from '@/utils/CustomBtn';
import { useRouter } from 'next/router';
import { useMyContext } from '@/Context/MyContextProvider';

const UserProfileDrawer = ({ show, onHide, userData, onLogout }) => {
    const router = useRouter();
    const { isMobile } = useMyContext();
    const MenuItem = ({ icon: Icon, label, onClick, href, className = "" }) => (
        <div
            className={`d-flex align-items-center justify-content-between rounded-3 mb-2 gray-bg cursor-pointer ${className}`}
            style={{ fontSize: "0.9rem", padding: "12px 10px" }}
            onClick={() => {
                if (onClick) onClick();
                if (href) router.push(href);
                onHide();
            }}
        >
            <div className="d-flex align-items-center gap-2">
                {Icon && <Icon size={16} className="text-muted" />}
                <span className="fw-medium">{label}</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
        </div>
    );

    return (
        <CustomDrawer
            showOffcanvas={show}
            setShowOffcanvas={onHide}
            title=""
            className="user-profile-drawer"
            hideIndicator={isMobile ? false : true}
            bodyClassName="p-0 d-flex flex-column"
        >
            <div
                className="d-flex flex-column"
                style={{ height: "100dvh" }}   // ✅ dynamic viewport height (iPhone fix)
            >

                {/* Scrollable Content */}
                <div className="flex-grow-1 overflow-auto px-3 pt-3">

                    {/* Profile Header */}
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <AvatarImage
                            src={userData?.photo}
                            alt="Profile"
                            name={userData?.name}
                            size={60}
                        />
                        <div>
                            <h5 className="mb-0 fw-bold text-capitalize">
                                {userData?.name || 'User'}
                            </h5>
                            <small className="text-muted">
                                {userData?.phone_number || userData?.email}
                            </small>
                        </div>
                    </div>

                    <MenuItem icon={Ticket} label="View all bookings" href="/bookings" />
                    <MenuItem icon={User} label="Profile" href="/profile" />

                    {/* Support */}
                    <div className="mt-4">
                        <h6 className="fw-bold mb-3">Support</h6>
                        <MenuItem
                            icon={MessageSquare}
                            label="Chat with us"
                            onClick={() =>
                                window.open('https://wa.me/918000408888', '_blank')
                            }
                        />
                        <MenuItem
                            icon={ShieldQuestionMark}
                            label="FAQ"
                            href="/faq"
                        />
                    </div>

                    {/* More */}
                    <div className="mt-4 mb-4">
                        <h6 className="fw-bold mb-3">More</h6>
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

                    <CustomBtn
                        variant="primary"
                        buttonText="Logout"
                        icon={<LogOut size={18} />}
                        iconPosition="left"
                        HandleClick={() => {
                            onLogout();
                            onHide();
                        }}

                        className="w-100 p-2"
                    />
                </div>

                {/* Bottom Logout */}
                <div
                    className=""
                >
                </div>

            </div>
        </CustomDrawer>
    );
};

export default UserProfileDrawer;