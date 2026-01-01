import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Phone } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import CustomBtn from "../../../utils/CustomBtn";

const SupportOptions = () => {
  // Open phone dialer (dummy number for demo)
  const handleCall = () => {
    const dummyNumber = "+918000308888"; // <- change this to your real number if needed
    window.location.href = `tel:${dummyNumber}`;
  };

  // Open WhatsApp chat
  const handleWhatsApp = () => {
    const phoneNumber = "918000408888";
    const message = encodeURIComponent("Chat ");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const options = [
    {
      id: "call",
      icon: Phone,
      title: "Call Support",
      sub: "Time:- 11 AM – 6 PM",
      buttonText: "Call",
      buttonVariant: "primary",
      iconColor: "text-primary",
      action: handleCall,
    },
    {
      id: "whatsapp",
      icon: BsWhatsapp,
      title: "Chat",
      sub: "Quick chat",
      buttonText: "Chat",
      buttonVariant: "success",
      iconColor: "text-success",
      action: handleWhatsApp,
    },
  ];

  return (
    <div className="my-4">
      <h5 className="text-center mb-3">Need Help?</h5>

      <Row className="g-3 justify-content-center">
        {options.map(({ id, icon: Icon, title, sub, buttonText, buttonVariant, iconColor, action }) => (
          <Col key={id} xs={12} sm={10} md={8} lg={6}>
            <Card className="border-dashed shadow-sm">
              <div className="d-flex align-items-center p-3 gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 44, height: 44, background: "rgba(255,255,255,0.05)" }}
                >
                  <Icon size={30} className={iconColor} />
                </div>

                <div className="flex-grow-1">
                  <div className="fw-semibold fs-3">{title}</div>
                  <small className="text-muted">{sub}</small>
                </div>

                {/* Desktop button */}
                <div className="d-none d-md-block">
                  <CustomBtn
                    variant={buttonVariant}
                    size="sm"
                    buttonText={buttonText}
                    HandleClick={action}
                    icon={<Icon size={16} />}
                  />
                </div>
              </div>

              {/* Mobile full-width button */}
              <div className="px-3 pb-3 d-block d-md-none">
                <CustomBtn
                  variant={buttonVariant}
                  size="sm"
                  buttonText={buttonText}
                  className="w-100"
                  HandleClick={action}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SupportOptions;
