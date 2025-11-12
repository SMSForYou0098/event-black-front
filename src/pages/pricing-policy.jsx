import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const PricingPolicy = () => {
  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Hero Section */}
 
      <h1 className="display-3 fw-bold text-center gradient-text">
                Pricing Policy
              </h1>

      {/* Main Content */}
      <section className='pt-3'>
        <Container>
          <Row>
            <Col lg={12}>
              {/* Section 1 */}
              <div className="policy-section">
                <h2 className="section-title">
                  <span className="section-icon">👥</span>
                  1. Event Organizer's Responsibility
                </h2>
                <div className="policy-content">
                  <p>
                    All ticket prices, offers, discounts, and related charges for events listed on GetYourTicket.in are solely determined and managed by the respective event organizers. Get Your Ticket acts only as an online ticketing and event management platform and does not influence, modify, or control the pricing or any commercial terms of the events hosted on the platform.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="policy-section">
                <h2 className="section-title">
                  <span className="section-icon">💵</span>
                  2. Price Display and Accuracy
                </h2>
                <div className="policy-content">
                  <p>
                    The prices displayed on the platform are uploaded directly by the event organizer. Get Your Ticket endeavors to ensure that the information shown is accurate; however, the platform does not guarantee the correctness, completeness, or current validity of any pricing information. Any discrepancies, errors, or disputes relating to ticket prices shall be resolved directly between the user (purchaser) and the event organizer.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="policy-section">
                <h2 className="section-title">
                  <span className="section-icon">📊</span>
                  3. Taxes and Additional Charges
                </h2>
                <div className="policy-content">
                  <p>
                    Ticket prices may be inclusive or exclusive of applicable taxes, convenience fees, or service charges as determined by the event organizer. Any such charges will be disclosed at the time of checkout. Get Your Ticket is not responsible for the imposition or modification of such charges by organizers or statutory authorities.
                  </p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="policy-section">
                <h2 className="section-title">
                  <span className="section-icon">💳</span>
                  4. Currency and Payment
                </h2>
                <div className="policy-content">
                  <p>
                    All payments shall be made in Indian Rupees (INR) unless otherwise specified. Prices are subject to change without prior notice as per the discretion of the event organizer. Once a booking is confirmed, the amount payable shall be as per the price displayed at the time of purchase.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="policy-section">
                <h2 className="section-title">
                  <span className="section-icon">⚖️</span>
                  5. Dispute Resolution
                </h2>
                <div className="policy-content">
                  <p>
                    In the event of any dispute regarding pricing, offers, or refunds, Get Your Ticket shall not be held liable and shall act only as a facilitator between the purchaser and the event organizer. The final authority to modify, cancel, or refund any ticket lies solely with the event organizer.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="policy-section">
                <h2 className="section-title">
                  <span className="section-icon">🛡️</span>
                  6. No Endorsement or Liability
                </h2>
                <div className="policy-content">
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