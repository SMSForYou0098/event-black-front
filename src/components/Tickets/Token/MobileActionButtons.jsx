import React from "react";
import { Download, SendHorizontal } from "lucide-react";
import MobileTwoButtonFooter from "@/utils/MobileTwoButtonFooter";
import CustomBtn from "@/utils/CustomBtn";
import { useMyContext } from "@/Context/MyContextProvider";

const MobileActionButtons = ({
    ticketData,
    ticketCount,
    disableCombineButton,
    imageLoaded,
    cardImageUrl,
    handleDownloadClick,
    handleTransferClick,
}) => {
    const { UserData } = useMyContext();
    if (!ticketData) return null;

    return (
        <div className="d-md-none bg-dark border-top sticky-bottom">
            {ticketData?.controls?.ticket_transfer && (
                <div className="px-3 pt-3">
                    {
                        UserData?.id === ticketData?.user_id && (
                            <CustomBtn
                                variant="outline-primary"
                                HandleClick={handleTransferClick}
                                className="w-100"
                                size="lg"
                                disabled={!imageLoaded && cardImageUrl}
                                icon={<SendHorizontal size={20} />}
                                iconPosition="left"
                                buttonText="Transfer"
                            />
                        )
                    }
                </div>
            )}
            <MobileTwoButtonFooter
                leftButton={
                    ticketCount > 1 && disableCombineButton ? (
                        <CustomBtn
                            variant="secondary"
                            HandleClick={() => handleDownloadClick("combine")}
                            className="w-100"
                            disabled={!imageLoaded && cardImageUrl}
                            icon={<Download size={20} />}
                            iconPosition="left"
                            buttonText="Combined"
                        />
                    ) : ticketCount === 1 ? (
                        <CustomBtn
                            variant="primary"
                            HandleClick={() => handleDownloadClick("single")}
                            className="w-100"
                            disabled={!imageLoaded && cardImageUrl}
                            icon={<Download size={20} />}
                            iconPosition="left"
                            buttonText="Download Ticket"
                        />
                    ) : null
                }
                rightButton={
                    ticketCount > 1 ? (
                        <CustomBtn
                            variant="primary"
                            HandleClick={() => handleDownloadClick("download")}
                            className="w-100"
                            disabled={!imageLoaded && cardImageUrl}
                            icon={<Download size={20} />}
                            iconPosition="left"
                            buttonText="Individual"
                        />
                    ) : null
                }
            />
        </div>
    );
};

export default MobileActionButtons;
