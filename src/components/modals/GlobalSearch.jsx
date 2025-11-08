import { useMyContext } from '@/Context/MyContextProvider';
import { api } from '@/lib/axiosInterceptor';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal, Form, ListGroup, Row, Col, Image, Badge } from 'react-bootstrap';

const GlobalSearch = ({ show, handleShow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const tabs = ['All', 'Events', 'Sports', 'Movies', 'Activity'];
  const { createSlug } = useMyContext();

  // Memoized trending items from API response
  // const trendingItems = useMemo(() => {
  //   return [
  //     {
  //       id: 33,
  //       title: "Indroda Nature And Amusement Park",
  //       category: "Amusement",
  //       type: "event", // Added type to determine route
  //       thumbnail: "http://192.168.0.112:8000/uploads/thumbnail/67ea728760f14_67d7fd2dcc91f_12222333.jpg"
  //     },
  //     {
  //       id: 65,
  //       title: "Music Fest 2025",
  //       category: "Live Concert",
  //       type: "event",
  //       thumbnail: "https://cricket.getyourticket.in/uploads/thumbnail/683ac8f0670bd_avp.jpg"
  //     },
  //     {
  //       id: 70,
  //       title: "Navratri",
  //       category: "Garba Night",
  //       type: "event",
  //       thumbnail: "https://cricket.getyourticket.in/uploads/thumbnail/688b2dfbc72ab_ff.jpg"
  //     },
  //     {
  //       id: 73,
  //       title: "Conference",
  //       category: "Business Seminars",
  //       type: "event",
  //       thumbnail: "http://192.168.0.120:8000/uploads/thumbnail/6883682f3e737_Management (600 x 725 px).jpg"
  //     }
  //   ];
  // }, []);

  // Function to handle navigation based on item type
  const handleItemClick = useCallback((item) => {
    // Close the modal first
    handleShow();
    
    // Determine the route based on item type or category
    const itemType = item?.type || item.category?.name?.toLowerCase() || 'event';
    
    switch(itemType) {
      case 'movie':
      case 'movies':
        router.push(`/movies/${createSlug(item.title || item.name)}/${item.id}`);
        break;
      case 'sport':
      case 'sports':
        router.push(`/sports/${createSlug(item.title || item.name)}/${item.id}`);
        break;
      case 'activity':
        router.push(`/activities/${createSlug(item.title || item.name)}/${item.id}`);
        break;
      case 'restaurant':
      case 'dining':
        router.push(`/dining/${createSlug(item.title || item.name)}/${item.id}`);
        break;
      case 'artist':
        router.push(`/artists/${createSlug(item.title || item.name)}/${item.id}`);
        break;
      default: // Default to event route
        router.push(`/events/${createSlug(item?.venue_event?.city || '')}/${createSlug(
          item?.organizer?.organisation || ''
        )}/${createSlug(item?.name || item?.title)}/${item?.event_key || item?.id}`);
        break;
    }
  }, [router, createSlug, handleShow]);

  // Optimized search function with useCallback
  const performSearch = useCallback(async (searchQuery, categories) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const categoryFilter = categories.includes('All') ? '' : categories.join(',');
      
      const response = await api.get('/global-search', {
        params: {
          search: searchQuery,
          event_category: categoryFilter
        }
      });
      
      setSearchResults(response.data?.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimized category toggle function
  const toggleCategory = useCallback((category) => {
    setSelectedCategories(prev => {
      if (category === 'All') {
        return ['All'];
      } else {
        const withoutAll = prev.filter(cat => cat !== 'All');
        const isSelected = prev.includes(category);
        
        if (isSelected) {
          const newSelected = withoutAll.filter(cat => cat !== category);
          return newSelected.length > 0 ? newSelected : ['All'];
        } else {
          return [...withoutAll, category];
        }
      }
    });
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch(searchTerm, selectedCategories);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategories, performSearch]);

  // Reset search when modal is closed
  useEffect(() => {
    if (!show) {
      setSearchTerm('');
      setSelectedCategories(['All']);
      setSearchResults([]);
    }
  }, [show]);

  // Memoized search results display
  const searchResultsDisplay = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-center py-4">
          <p>Searching...</p>
        </div>
      );
    }

     // No input yet — show friendly empty state
  if (!searchTerm.trim()) {
    return (
      <div className="text-center py-5">
        <h6 className="mb-2">Search your events</h6>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
          Try keywords like <em>“music”</em>, <em>“navratri”</em>, <em>“cricket”</em>, or <em>“movies”</em>.
        </p>
      </div>
    );
  }

    const itemsToShow = searchTerm && searchResults.length > 0 ? searchResults : [];
    
    if (searchTerm && searchResults.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted">No items found matching your criteria.</p>
        </div>
      );
    }

    return (
      <Row>
        {itemsToShow.map((item) => (
          <Col md={6} key={item.id} className="mb-3">
            <ListGroup.Item 
              className="border-0 bg-transparent p-2 rounded hover-item"
              style={{ cursor: 'pointer' }}
              action
              onClick={() => handleItemClick(item)}
            >
              <div className="d-flex align-items-center">
                {(item?.thumbnail || item?.image) && (
                  <Image
                    src={item?.thumbnail || item?.image}
                    alt={item?.name || item?.title}
                    width={50}
                    height={50}
                    className="rounded me-3 flex-shrink-0"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-grow-1 min-width-0">
                  <h6 className="mb-1 fw-bold text-truncate" style={{ fontSize: '15px' }}>
                    {item?.name || item?.title}
                  </h6>
                  <small className="text-muted" style={{ fontSize: '13px' }}>
                    {item?.category_datanew?.title || item?.category}
                    {item?.type && ` • ${item.type}`}
                  </small>
                </div>
              </div>
            </ListGroup.Item>
          </Col>
        ))}
      </Row>
    );
  }, [isLoading, searchTerm, searchResults, handleItemClick]);

  return (
    <Modal 
      show={show} 
      onHide={handleShow} 
      size="lg" 
      centered
      className="trending-modal"
    >
      <Modal.Header className="border-0 pb-2">
        <Modal.Title className="w-100">
          <Form.Control
            type="text"
            placeholder="Search for your favorite events, movies, shows, and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-pill card-glassmorphism__input"
            style={{ fontSize: '16px' }}
            autoFocus
          />
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-4 py-3">
        {/* Category Filter Badges */}
        {/* <div className="mb-4">
          <h6 className="fw-bold mb-2">Filter by Category:</h6>
          <div className="d-flex flex-wrap gap-2">
            {tabs.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <Badge
                  key={category}
                  bg={isSelected ? 'primary' : 'light'}
                  text={isSelected ? 'white' : 'dark'}
                  className="px-3 py-2 rounded-pill cursor-pointer user-select-none"
                  onClick={() => toggleCategory(category)}
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  {category}
                  {isSelected && category !== 'All' && (
                    <span className="ms-1">×</span>
                  )}
                </Badge>
              );
            })}
          </div>
        </div> */}

        {/* Results Header */}
        {/* <div className="mb-3">
          <h5 className="fw-bold mb-3">
            {searchTerm && searchResults.length > 0 
              ? `Search Results for "${searchTerm}"` 
              : 'Trending Now'
            }
          </h5>
        </div> */}

        {/* Search Results */}
        
        <ListGroup variant="flush">
          {searchResultsDisplay}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default GlobalSearch;