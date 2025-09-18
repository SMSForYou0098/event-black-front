import React, { useState } from 'react';
import { Modal, Button, Form, Nav, ListGroup, Row, Col, Image } from 'react-bootstrap';

const GlobalSearch = ({show,handleShow}) => {

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const trendingItems = [
    {
      id: 1,
      title: "Jolly LLB 3",
      category: "Movie",
      type: "Movies",
      image: "https://via.placeholder.com/50x50/ff6b35/ffffff?text=JL3"
    },
    {
      id: 2,
      title: "Noida Dandiya Fest 2.0",
      category: "Event",
      type: "Events",
      image: "https://via.placeholder.com/50x50/e74c3c/ffffff?text=NDF"
    },
    {
      id: 3,
      title: "Xero Degrees",
      category: "Restaurant",
      type: "Dining",
      image: "https://via.placeholder.com/50x50/f39c12/ffffff?text=XD"
    },
    {
      id: 4,
      title: "Satinder Sartaaj",
      category: "Artist",
      type: "Activity",
      image: "https://via.placeholder.com/50x50/27ae60/ffffff?text=SS"
    },
    {
      id: 5,
      title: "Demon Slayer: Kimetsu no Yaiba Infinity Castle",
      category: "Movie",
      type: "Movies",
      image: "https://via.placeholder.com/50x50/8e44ad/ffffff?text=DS"
    },
    {
      id: 6,
      title: "Osho Active Morning Meditation",
      category: "Event",
      type: "Events",
      image: "https://via.placeholder.com/50x50/d35400/ffffff?text=OM"
    },
    {
      id: 7,
      title: "Viva - All Day Dining - Holiday Inn",
      category: "Restaurant",
      type: "Dining",
      image: "https://via.placeholder.com/50x50/2980b9/ffffff?text=VI"
    },
    {
      id: 8,
      title: "Hanumankind",
      category: "Artist",
      type: "Activity",
      image: "https://via.placeholder.com/50x50/34495e/ffffff?text=HK"
    },
    {
      id: 9,
      title: "The Conjuring: Last Rites",
      category: "Movie",
      type: "Movies",
      image: "https://via.placeholder.com/50x50/7f8c8d/ffffff?text=TC"
    },
    {
      id: 10,
      title: "Mini Golf Madness | Gurugram",
      category: "Event",
      type: "Events",
      image: "https://via.placeholder.com/50x50/16a085/ffffff?text=MG"
    },
    {
      id: 11,
      title: "Fifth Avenue Bakery & Cafe",
      category: "Restaurant",
      type: "Dining",
      image: "https://via.placeholder.com/50x50/c0392b/ffffff?text=FA"
    },
    {
      id: 12,
      title: "Meba Ofilia",
      category: "Artist",
      type: "Activity",
      image: "https://via.placeholder.com/50x50/9b59b6/ffffff?text=MO"
    }
  ];

  const tabs = ['All', 'Events', 'Sports', 'Movies', 'Activity'];

  const filteredItems = trendingItems.filter(item => {
    const matchesTab = activeTab === 'All' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <Modal 
        show={show} 
        onHide={handleShow} 
        size="lg" 
        centered
        className="trending-modal"
      >
        <Modal.Header closeButton className="border-0 pb-2">
          <Modal.Title className="w-100">
            <Form.Control
              type="text"
              placeholder="Search for your favorite events, movies, shows, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-pill card-glassmorphism__input"
              style={{ fontSize: '16px' }}
            />
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="px-4 py-3">
          {/* Navigation Tabs */}
          <Nav variant="pills" className="mb-4 justify-content-start">
            {tabs.map((tab) => (
              <Nav.Item key={tab} className="me-2">
                <Nav.Link
                  active={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-pill ${
                    activeTab === tab 
                      ? 'bg-primary text-white' 
                      : 'custom-dark-content-bg border-0'
                  }`}
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {/* Trending Section */}
          <div className="mb-3">
            <h5 className="fw-bold mb-3">Trending in Gurugram</h5>
          </div>

          {/* Items List */}
          <ListGroup variant="flush">
            <Row>
              {filteredItems.map((item, index) => (
                <Col md={6} key={item.id} className="mb-3">
                  <ListGroup.Item 
                    className="border-0 bg-transparent p-2 rounded hover-item"
                    style={{ cursor: 'pointer' }}
                    action
                  >
                    <div className="d-flex align-items-center">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={50}
                        height={50}
                        className="rounded me-3 flex-shrink-0"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1 min-width-0">
                        <h6 className="mb-1 fw-bold text-truncate" style={{ fontSize: '15px' }}>
                          {item.title}
                        </h6>
                        <small className="text-muted" style={{ fontSize: '13px' }}>
                          {item.category}
                        </small>
                      </div>
                    </div>
                  </ListGroup.Item>
                </Col>
              ))}
            </Row>
          </ListGroup>

          {filteredItems.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No items found matching your criteria.</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default GlobalSearch