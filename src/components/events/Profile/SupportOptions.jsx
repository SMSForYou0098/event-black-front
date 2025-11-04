import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Phone, MessageCircle } from "lucide-react";
import CustomBtn from "../../../utils/CustomBtn";
import { BsWhatsapp } from "react-icons/bs"; // WhatsApp icon from react-icons

const SupportOptions = () => {
  const handleCall = () => {
    window.location.href = "tel:+918000308888";
  };

  const handleWhatsApp = () => {
    const phoneNumber = "919180004088";
    const message = encodeURIComponent("support");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const options = [
    {
      id: "call",
      icon: Phone,
      title: "Call Us",
      description: (
        <>
          Available from <strong>11 AM to 6 PM</strong>
        </>
      ),
      buttonText: "Call Now",
      buttonVariant: "primary",
      iconColor: "text-primary",
      action: handleCall,
    },
    {
      id: "whatsapp",
      icon: BsWhatsapp,
      title: "WhatsApp Us",
      description: "Chat with us on WhatsApp for quick support.",
      buttonText: "Chat Now",
      buttonVariant: "success",
      iconColor: "text-success",
      action: handleWhatsApp,
    },
  ];

  return (
    <Container className="my-5">
      <h3 className="text-center mb-4">Need Help?</h3>

      <Row className="justify-content-center g-5">
        {options.map(({ id, icon: Icon, title, description, buttonText, buttonVariant, iconColor, action }) => (
          <Col key={id} xs={12} md={8} lg={6}>
            <Card className="shadow-sm border-0">
              <Row className="align-items-center border-dashed p-3">
                <Col xs="2">
                  <Icon size={48} className={iconColor} />
                </Col>
                <Col xs="10" className="d-flex justify-content-between">
                  <div className="d-flex flex-column">
                    <h5 className="mb-1">{title}</h5>
                    <p className="mb-2">{description}</p>
                  </div>
                  <CustomBtn 
                    variant={buttonVariant} 
                    size="sm" 
                    buttonText={buttonText}
                    HandleClick={action}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SupportOptions;