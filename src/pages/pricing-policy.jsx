import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const PricingPolicy = () => {
  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        .pricing-hero {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%);
          position: relative;
          overflow: hidden;
        }
        
        .pricing-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .pricing-section {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.7) 100%);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 20px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .pricing-section:hover {
          border-color: rgba(96, 165, 250, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(96, 165, 250, 0.1);
        }
        
        .section-title {
          color: #60a5fa;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid rgba(96, 165, 250, 0.3);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .section-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        
        .pricing-content {
          color: #d1d5db;
          line-height: 1.8;
          font-size: 1rem;
        }
        
        .pricing-content p {
          margin-bottom: 1rem;
        }
        
        .pricing-content strong {
          color: #93c5fd;
          font-weight: 600;
        }
        
        .highlight-box {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          border-left: 4px solid #60a5fa;
          padding: 1.25rem;
          border-radius: 12px;
          margin: 1.5rem 0;
        }
        
        .info-badge {
          display: inline-block;
          background: rgba(96, 165, 250, 0.2);
          color: #60a5fa;
          padding: 0.35rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
          border: 1px solid rgba(96, 165, 250, 0.3);
        }
        
        .footer-note {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
          border: 1px solid rgba(96, 165, 250, 0.4);
          border-radius: 16px;
          padding: 2rem;
          margin-top: 3rem;
          text-align: center;
        }
        
        .last-updated {
          color: #9ca3af;
          font-size: 0.9rem;
          text-align: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(75, 85, 99, 0.3);
        }
      `}</style>

      {/* Hero Section */}
      <section className="pricing-hero text-white py-5" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Container className="position-relative" style={{ zIndex: 10 }}>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
              <div className="mb-3" style={{ fontSize: '3.5rem' }}>💰</div>
              <h1 className="display-3 fw-bold mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                Pricing Policy
              </h1>
              <p className="lead fs-5" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Understanding our transparent pricing structure and organizer responsibilities
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-5" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <Container>
          <Row>
            <Col lg={12}>
              {/* Section 1 */}
              <div className="pricing-section">
                <h2 className="section-title">
                  <span className="section-icon">👥</span>
                  1. Event Organizer's Responsibility
                </h2>
                <div className="pricing-content">
                  <p>
                    All ticket prices, offers, discounts, and related charges for events listed on GetYourTicket.in are solely determined and managed by the respective event organizers. Get Your Ticket acts only as an online ticketing and event management platform and does not influence, modify, or control the pricing or any commercial terms of the events hosted on the platform.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="pricing-section">
                <h2 className="section-title">
                  <span className="section-icon">💵</span>
                  2. Price Display and Accuracy
                </h2>
                <div className="pricing-content">
                  <p>
                    The prices displayed on the platform are uploaded directly by the event organizer. Get Your Ticket endeavors to ensure that the information shown is accurate; however, the platform does not guarantee the correctness, completeness, or current validity of any pricing information. Any discrepancies, errors, or disputes relating to ticket prices shall be resolved directly between the user (purchaser) and the event organizer.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="pricing-section">
                <h2 className="section-title">
                  <span className="section-icon">📊</span>
                  3. Taxes and Additional Charges
                </h2>
                <div className="pricing-content">
                  <p>
                    Ticket prices may be inclusive or exclusive of applicable taxes, convenience fees, or service charges as determined by the event organizer. Any such charges will be disclosed at the time of checkout. Get Your Ticket is not responsible for the imposition or modification of such charges by organizers or statutory authorities.
                  </p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="pricing-section">
                <h2 className="section-title">
                  <span className="section-icon">💳</span>
                  4. Currency and Payment
                </h2>
                <div className="pricing-content">
                  <p>
                    All payments shall be made in Indian Rupees (INR) unless otherwise specified. Prices are subject to change without prior notice as per the discretion of the event organizer. Once a booking is confirmed, the amount payable shall be as per the price displayed at the time of purchase.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="pricing-section">
                <h2 className="section-title">
                  <span className="section-icon">⚖️</span>
                  5. Dispute Resolution
                </h2>
                <div className="pricing-content">
                  <p>
                    In the event of any dispute regarding pricing, offers, or refunds, Get Your Ticket shall not be held liable and shall act only as a facilitator between the purchaser and the event organizer. The final authority to modify, cancel, or refund any ticket lies solely with the event organizer.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="pricing-section">
                <h2 className="section-title">
                  <span className="section-icon">🛡️</span>
                  6. No Endorsement or Liability
                </h2>
                <div className="pricing-content">
                  <p>
                    Get Your Ticket does not endorse or guarantee any event pricing, value, or quality of services provided by event organizers. The platform's role is limited to providing a secure, reliable, and convenient booking interface.
                  </p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="footer-note">
                <p className="mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#e5e7eb', fontWeight: '500' }}>
                  By using GetYourTicket.in, users acknowledge and agree that Get Your Ticket bears no responsibility for pricing policies, changes, or decisions made by event organizers.
                </p>
              </div>

              {/* Last Updated */}
              <div className="last-updated">
                <p className="mb-0">
                  Please review this Pricing Policy regularly. Your continued use of the platform constitutes acceptance of any updates.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default PricingPolicy;