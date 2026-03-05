import CustomBtn from "@/utils/CustomBtn";
import { Download, ArrowRightLeft, SendHorizontal } from "lucide-react";
import { useMyContext } from "@/Context/MyContextProvider";

const DesktopActionButtons = ({
    ticketData,
    ticketCount,
    disableCombineButton,
    imageLoaded,
    cardImageUrl,
    handleDownloadClick,
    handleTransferClick,
}) => {
    const { UserData } = useMyContext();
    return (
        <div className="text-center mb-4 d-none d-md-block">
            {ticketCount > 1 ? (
                <div className="d-flex justify-content-center gap-3">
                    {ticketData?.controls?.ticket_transfer && UserData?.id === ticketData?.user_id && (
                        <CustomBtn
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
                            variant="secondary"
                            HandleClick={() => handleDownloadClick("combine")}
                            disabled={!imageLoaded && cardImageUrl}
                            buttonText="Combined Ticket"
                            icon={<Download size={20} />}
                            iconPosition="left"
                        />
                    )}

                    <CustomBtn
                        variant="primary"
                        HandleClick={() => handleDownloadClick("download")}
                        disabled={!imageLoaded && cardImageUrl}
                        buttonText="Individual Tickets"
                        icon={<Download size={20} />}
                        iconPosition="left"
                    />


                </div>
            ) : (
                <div className="d-flex justify-content-center gap-3">
                    <CustomBtn
                        variant="primary"
                        HandleClick={() => handleDownloadClick("single")}
                        disabled={!imageLoaded && cardImageUrl}
                        buttonText="Download Ticket"
                        icon={<Download size={20} />}
                        iconPosition="left"
                    />

                    {ticketData?.controls?.ticket_transfer && (
                        <CustomBtn
                            variant="outline-primary"
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
