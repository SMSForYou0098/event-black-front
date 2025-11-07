import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <style>{`
        .hero-section {
          background: linear-gradient(135deg, #b5151530 0%, #000 50%, #b5151545 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-section::before {
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
          background: linear-gradient(135deg, #b51515 0%, #b51515 50%, #b51515 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-card {
          background: linear-gradient(135deg, #b5151010 0%, rgba(17, 24, 39, 0.9) 100%);
          border: 1px solid rgba(75, 85, 99, 0.5);
          border-radius: 24px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          transform: translateY(-8px);
          border-color: #b51515;
          box-shadow: 0 20px 40px #b5151530;
        }
        
        .value-card {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border: 1px solid #374151;
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
        }
        
        .value-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .value-card.green:hover {
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: 0 25px 50px -12px rgba(34, 197, 94, 0.3);
        }
        
        .value-card.orange:hover {
          border-color: rgba(249, 115, 22, 0.5);
          box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.3);
        }
        
        .value-card.blue:hover {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.3);
        }
        
        .icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: transform 0.3s ease;
          font-size: 2.5rem;
        }
        
        .value-card:hover .icon-wrapper {
          transform: scale(1.15) rotate(5deg);
        }
        
        .icon-green {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        }
        
        .icon-orange {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        }
        
        .icon-blue {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        
        .about-block {
          background: linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(88, 28, 135, 0.2) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }
        
        .about-block:hover {
          transform: translateX(8px);
          border-color: rgba(96, 165, 250, 0.5);
          background: linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(88, 28, 135, 0.3) 100%);
        }
        
        .highlight-block {
          background: linear-gradient(135deg, #b5151595 0%, #b5151530 100%);
          border-radius: 20px;
          padding: 2rem;
          border: 2px solid #b5151560;
        }
        
        .green-section {
          background: linear-gradient(135deg, #16a34a40 0%, #16a34a20 50%, #16a34a19 100%);
          position: relative;
          overflow: hidden;
        }
        
        .green-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
        }
        
        .concept-section {
          background: linear-gradient(135deg, #111827 0%, #000000 100%);
        }
        
        .badge-tag {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          padding: 0.5rem 1.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-section text-white py-5" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Container className="position-relative" style={{ zIndex: 10 }}>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
              <div className="badge-tag mb-4">
                <span style={{ fontSize: '1.5rem' }}>✨</span>
                <span className="fw-semibold">Smart Event Ticketing Platform</span>
              </div>
              
              <h1 className="display-3 fw-bold mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: '1.2' }}>
                Your smart partner for online event ticketing.
              </h1>
              
              <p className="lead fs-4 mb-0" style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '800px', margin: '0 auto' }}>
                From concerts to tournaments, we simplify ticket sales, QR entry, and WhatsApp delivery — all in one platform.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* What is Get Your Ticket */}
      <section className="py-5" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={11}>
              <div className="glass-card p-5">
                <h2 className="text-center mb-4 fw-bold gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                  What is Get Your Ticket?
                </h2>
                <p className="text-center fs-5 mb-0" style={{ color: '#d1d5db', lineHeight: '1.8' }}>
                  Get Your Ticket is a smart event ticketing platform built for modern organizers. We simplify ticket sales, check-ins, and reporting with features like WhatsApp ticket delivery and QR code scanning. Whether it's a concert, sports event, or cultural fest — we offer a fast, reliable, and cost-effective solution to manage your entire event journey.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-5" style={{ paddingTop: '5rem', paddingBottom: '5rem', background: 'linear-gradient(180deg, #0a0a0a 0%, #111827 100%)' }}>
        <Container>
          <h2 className="text-center mb-5 fw-bold gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            About Us
          </h2>
          
          <Row>
            <Col lg={6} className="mb-4">
              <div className="about-block">
                <p className="mb-0" style={{ color: '#d1d5db', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  Get Your Ticket is a modern digital ticketing solution designed to simplify and speed up ticket delivery and validation — with zero paper usage. We help organizers, event managers, go fully digital by e-tickets via SMS, Email, and WhatsApp.
                </p>
              </div>
              
              <div className="about-block">
                <p className="mb-0" style={{ color: '#d1d5db', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  Trava Get Your Ticket Pvt. Ltd. simplifies event management by offering an all-in-one digital solution. From online registrations to automated ticket generation, and WhatsApp-based confirmations, every process is optimized for speed and convenience.
                </p>
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="about-block">
                <p className="mb-0" style={{ color: '#d1d5db', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  Organizers can track attendees in real time, manage entry with QR code scanning, and get instant reports. Our system is flexible and scalable—perfect for small gatherings to large-scale festivals.
                </p>
              </div>
              
              <div className="about-block">
                <p className="mb-0" style={{ color: '#d1d5db', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  We focus on making your event more efficient, engaging, and organized. With built-in support for bulk messaging, multi-channel notifications, and custom landing pages, we help you increase reach and attendance. Plus, our platform reduces manpower dependency and ensures cost-effective operations.
                </p>
              </div>
              
              <div className="highlight-block">
                <p className="mb-0 text-white fw-semibold" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                  With Get Your Ticket, you don't just run events—you unlock new opportunities to grow, connect, and deliver memorable experiences.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Core Values */}
      <section className="py-5" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Container>
          <h2 className="text-center mb-5 fw-bold gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Our Core Values
          </h2>
          
          <Row className="g-4">
            <Col md={4}>
              <Card className="value-card green border-0 shadow-lg p-4">
                <Card.Body className="text-center">
                  <div className="icon-wrapper icon-green">
                    🌱
                  </div>
                  <Card.Title className="mb-3 fw-bold fs-4" style={{ color: '#22c55e' }}>
                    Environment Friendly
                  </Card.Title>
                  <Card.Text style={{ color: '#9ca3af', lineHeight: '1.8' }}>
                    All-in-One Event Platform with Omni Booking Power. From setup to check-in, marketing to analytics — manage it all, effortlessly and paperlessly.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="value-card orange border-0 shadow-lg p-4">
                <Card.Body className="text-center">
                  <div className="icon-wrapper icon-orange">
                    📈
                  </div>
                  <Card.Title className="mb-3 fw-bold fs-4" style={{ color: '#f97316' }}>
                    Creating Opportunities
                  </Card.Title>
                  <Card.Text style={{ color: '#9ca3af', lineHeight: '1.8' }}>
                    Empowering local employment while maximizing cost-efficiency through digital workflows. Get Your Ticket helps you save more, manage better, and grow smarter — every step of the way.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="value-card blue border-0 shadow-lg p-4">
                <Card.Body className="text-center">
                  <div className="icon-wrapper icon-blue">
                    ⚡
                  </div>
                  <Card.Title className="mb-3 fw-bold fs-4" style={{ color: '#3b82f6' }}>
                    Time saver approach
                  </Card.Title>
                  <Card.Text style={{ color: '#9ca3af', lineHeight: '1.8' }}>
                    Being a fully digital ticketing platform, it is designed to save your valuable time. From event creation, tickets to QR-based check-ins and live reporting — every step is streamlined and instant. With no paperwork and everything handled online, you get a faster and smoother event experience from start to finish.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Go Green Section */}
      <section className="green-section text-white py-5 position-relative" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Container className="position-relative" style={{ zIndex: 10 }}>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
              <div className="mb-4" style={{ fontSize: '4rem' }}>♻️</div>
              <h2 className="mb-4 fw-bold fs-1">
                Supporting mother Earth
              </h2>
              <p className="lead fs-4" style={{ lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.95)' }}>
                Go Green with Get Your Ticket – A 100% Paperless Ticketing Platform. No printing, no waste — just smooth, digital entry through WhatsApp and QR codes. Together, we simplify events while taking a step toward protecting Mother Earth. 🌍
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Our Event Universe Section */}
      {/* <section className="py-5" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Container>
          <h2 className="text-center mb-4 fw-bold gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Our Event Universe
          </h2>
          <p className="text-center mb-5" style={{ color: '#9ca3af', fontSize: '1.1rem', lineHeight: '1.8' }}>
            Some of our events that show our success journey and efforts we have put in to build this solution.
          </p>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="p-5 rounded-3 border" style={{ 
                background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.7) 100%)',
                borderColor: 'rgba(75, 85, 99, 0.3)'
              }}>
                <p className="mb-0" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Event showcase gallery will be displayed here
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section> */}

      {/* Concept Section */}
      <section className="concept-section text-white py-5" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
              <div className="mb-4" style={{ fontSize: '3.5rem' }}>🏆</div>
              <h2 className="mb-4 fw-bold gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                Concept
              </h2>
              <p className="lead fs-4" style={{ lineHeight: '1.8', color: '#d1d5db' }}>
                At Get Your Ticket, we go beyond ticketing — making event management fast, seamless, and future-ready.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutUs;