import { PhoneOutgoing } from 'lucide-react';
import React from 'react';
import { Button } from 'react-bootstrap';
import { BsWhatsapp } from 'react-icons/bs';

const ContactButtons = () => {
  const phoneNumber = '918000308888';
  const whatsappMessage =
    'Chat';

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(
      `https://wa.me/918000408888?text=${encodedMessage}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCallClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <>
      <style>{`
        .floating-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          padding: 0;
        }
        
        .floating-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        
        .floating-btn:active {
          transform: scale(0.95);
        }
        
        .whatsapp-btn {
          background-color: #25D366;
        }
        
        .whatsapp-btn:hover {
          background-color: #20BA5A;
        }
        
        .call-btn {
          background-color: #b51515;
        }
        
        .call-btn:hover {
          background-color: #b51515;
        }
        
        .floating-container {
          position: fixed;
          left: 20px;
          bottom: 150px;
          z-index: 1050;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        @media (min-width: 576px) {
          .floating-container {
            display: none;
          }
        }
      `}</style>

      <div className="floating-container">
        {/* WhatsApp Button */}
        <Button
          onClick={handleWhatsAppClick}
          className="floating-btn whatsapp-btn"
          aria-label="Contact via WhatsApp"
        >
          <BsWhatsapp size={28} color="#fff" />
        </Button>

        {/* Call Button */}
        <Button
          onClick={handleCallClick}
          className="floating-btn call-btn"
          aria-label="Call us"
        >
          <PhoneOutgoing size={24} color="#fff" />
        </Button>
      </div>
    </>
  );
};

export default ContactButtons;