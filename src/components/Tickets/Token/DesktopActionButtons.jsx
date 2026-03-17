import CustomBtn from "@/utils/CustomBtn";
import { Download, ArrowRightLeft, SendHorizontal, Home, User as UserIcon } from "lucide-react";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";

const DesktopActionButtons = ({
    ticketData,
    ticketCount,
    disableCombineButton,
    imageLoaded,
    cardImageUrl,
    handleDownloadClick,
    handleTransferClick,
}) => {
    const { UserData, isLoggedIn } = useMyContext();
    const router = useRouter();

    const homeAndBookings = (
        <>
            <CustomBtn
                size="sm"
                variant="outline-secondary"
                HandleClick={() => router.push("/")}
                buttonText="Home"
                icon={<Home size={20} />}
                iconPosition="left"
            />
            <CustomBtn
                size="sm"
                variant="outline-secondary"
                HandleClick={() => router.push("/bookings")}
                buttonText="Bookings"
                icon={<UserIcon size={20} />}
                iconPosition="left"
            />
        </>
    );

    return (
        <div className="text-center mb-4 d-none d-lg-block">
            {ticketCount > 1 ? (
                <div className="d-flex flex-nowrap justify-content-center gap-3">
                    {/* {homeAndBookings} */}
                    {ticketData?.controls?.ticket_transfer && UserData?.id === ticketData?.user_id && (

                        <CustomBtn
                            size="sm"
                            variant="outline-primary"
                            HandleClick={handleTransferClick}
                            disabled={!imageLoaded && cardImageUrl}
                            buttonText="Transfer"
                            icon={<SendHorizontal size={20} />}
                            iconPosition="left"
                        />
                    )}


                    {disableCombineButton && (
                        <CustomBtn
                            size="sm"
                            variant="secondary"
                            HandleClick={() => handleDownloadClick("combine")}
                            disabled={!imageLoaded && cardImageUrl}
                            buttonText="Group Ticket"
                            icon={<Download size={20} />}
                            iconPosition="left"
                        />
                    )}

                    <CustomBtn
                        size="sm"
                        variant="primary"
                        HandleClick={() => handleDownloadClick("download")}
                        disabled={!imageLoaded && cardImageUrl}
                        buttonText="Single Tickets"
                        icon={<Download size={20} />}
                        iconPosition="left"
                    />


                </div>
            ) : (
                <div className="d-flex flex-nowrap justify-content-center gap-3">
                    {/* {homeAndBookings} */}
                    <CustomBtn
                        size="sm"

                        variant="primary"
                        HandleClick={() => handleDownloadClick("single")}
                        disabled={!imageLoaded && cardImageUrl}
                        buttonText="Download Ticket"
                        icon={<Download size={20} />}
                        iconPosition="left"
                    />

                    {ticketData?.controls?.ticket_transfer && (
                        <CustomBtn
                            size="sm"
                            variant="secondary"
                            HandleClick={handleTransferClick}
                            disabled={!imageLoaded && cardImageUrl}
                            buttonText="Transfer"
                            icon={<SendHorizontal size={20} />}
                            iconPosition="left"
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default DesktopActionButtons;
