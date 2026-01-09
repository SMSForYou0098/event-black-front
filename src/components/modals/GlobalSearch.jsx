import { useMyContext } from '@/Context/MyContextProvider';
import { api } from '@/lib/axiosInterceptor';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Modal, Form, Badge, Image, ListGroup, InputGroup, Button, Card, Row, Col } from 'react-bootstrap';
import { Search, X, Clock, TrendingUp, Calendar, MapPin, Tag } from 'lucide-react';

const GlobalSearch = ({ show, handleShow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const router = useRouter();
  const searchInputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  const tabs = ['All', 'Events', 'Sports', 'Movies', 'Activity'];
  const { createSlug } = useMyContext();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save to recent searches
  const saveToRecentSearches = useCallback((item) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  // Handle navigation
  const handleItemClick = useCallback((item) => {
    saveToRecentSearches(item);
    handleShow();

    const itemType = item?.type || item.category?.name?.toLowerCase() || 'event';

    switch (itemType) {
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
      default:
        router.push(`/events/${createSlug(item?.venue?.city || '')}/${createSlug(
          item?.organizer?.organisation || ''
        )}/${createSlug(item?.name || item?.title)}/${item?.event_key || item?.id}`);
        break;
    }
  }, [router, createSlug, handleShow, saveToRecentSearches]);

  // Search function
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
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch(searchTerm, selectedCategories);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategories, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show) return;

      const resultsCount = searchResults.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % resultsCount);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + resultsCount) % resultsCount);
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleItemClick(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleShow();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, searchResults, selectedIndex, handleItemClick, handleShow]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsContainerRef.current && searchResults.length > 0) {
      const selectedElement = resultsContainerRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, searchResults]);

  // Reset on modal close
  useEffect(() => {
    if (!show) {
      setSearchTerm('');
      setSelectedCategories(['All']);
      setSearchResults([]);
      setSelectedIndex(0);
    } else {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [show]);

  // Result Card Component
  const ResultCard = useCallback(({ item, index, isSelected }) => (
    <ListGroup.Item
      action
      active={isSelected}
      onClick={() => handleItemClick(item)}
      onMouseEnter={() => setSelectedIndex(index)}
      className="border-0 bg-transparent"
    >
      <Row className="g-3 align-items-center">
        <Col xs="auto">
          {(item?.event_media?.thumbnail || item?.image) ? (
            <Image
              src={item?.event_media?.thumbnail || item?.image}
              alt={item?.name || item?.title}
              width={60}
              height={60}
              className="rounded"
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
              <Tag size={24} className="text-secondary" />
            </div>
          )}
        </Col>

        <Col>
          <h6 className="mb-1 fw-semibold text-truncate">{item?.name || item?.title}</h6>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {item?.category_datanew?.title && (
              <Badge bg="primary" className="text-uppercase" style={{ fontSize: '10px' }}>
                {item.category_datanew.title}
              </Badge>
            )}
            {item?.date_range && (
              <small className="text-muted d-flex align-items-center gap-1">
                <Calendar size={12} />
                {item.date_range}
              </small>
            )}
            {item?.venue?.city && (
              <small className="text-muted d-flex align-items-center gap-1">
                <MapPin size={12} />
                {item.venue.city}
              </small>
            )}
          </div>
        </Col>
      </Row>
    </ListGroup.Item>
  ), [handleItemClick]);

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="p-3">
      {[1, 2, 3].map(i => (
        <Card key={i} className="mb-2 bg-secondary bg-opacity-10 border-0">
          <Card.Body>
            <Row className="g-3">
              <Col xs="auto">
                <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '60px', height: '60px' }}></div>
              </Col>
              <Col>
                <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{ height: '16px', width: '70%' }}></div>
                <div className="bg-secondary bg-opacity-25 rounded" style={{ height: '12px', width: '50%' }}></div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  return (
    <Modal
      show={show}
      onHide={handleShow}
      centered
      size="lg"
      keyboard={false}
      className="modern-search-modal"
    >
      <Modal.Header className="border-bottom border-secondary border-opacity-25 pb-3">
        <div className="w-100">
          <InputGroup className="bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25">
            <InputGroup.Text className="bg-transparent border-0 text-muted">
              <Search size={20} />
            </InputGroup.Text>
            <Form.Control
              ref={searchInputRef}
              type="text"
              placeholder="Search events, movies, shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 text-white shadow-none"
              autoFocus
            />
            {searchTerm && (
              <Button
                variant="link"
                className="text-muted text-decoration-none"
                onClick={() => setSearchTerm('')}
              >
                <X size={18} />
              </Button>
            )}
            {/* <Button
              variant="link"
              className="text-muted text-decoration-none"
              onClick={handleShow}
            >
              <Badge bg="secondary" className="text-white">Esc</Badge>
            </Button> */}
          </InputGroup>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : searchTerm && searchResults.length > 0 ? (
          <>
            <div className="px-3 py-2 border-bottom border-secondary border-opacity-25">
              <small className="text-muted">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </small>
            </div>
            <ListGroup variant="flush" ref={resultsContainerRef}>
              {searchResults.map((item, index) => (
                <ResultCard
                  key={item.id}
                  item={item}
                  index={index}
                  isSelected={index === selectedIndex}
                />
              ))}
            </ListGroup>
          </>
        ) : searchTerm && !isLoading ? (
          <div className="text-center py-5">
            <Search size={48} className="text-muted mb-3" />
            <h6 className="mb-2">No results found</h6>
            <p className="text-muted small mb-0">Try different keywords or check your spelling</p>
          </div>
        ) : recentSearches.length > 0 ? (
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <Clock size={16} className="text-muted" />
                <small className="fw-semibold text-muted">Recent Searches</small>
              </div>
              <Button
                variant="link"
                size="sm"
                className="text-primary text-decoration-none p-0"
                onClick={clearRecentSearches}
              >
                Clear all
              </Button>
            </div>
            <ListGroup variant="flush">
              {recentSearches.map((item, index) => (
                <ResultCard
                  key={item.id}
                  item={item}
                  index={index}
                  isSelected={false}
                />
              ))}
            </ListGroup>
          </div>
        ) : (
          <div className="text-center py-5">
            <TrendingUp size={48} className="text-muted mb-3" />
            <h6 className="mb-2">Start searching</h6>
            <p className="text-muted small mb-3">Try searching for events, movies, or shows</p>
            <div className="d-flex gap-2 justify-content-center">
              <Badge bg="secondary">music</Badge>
              <Badge bg="secondary">cricket</Badge>
              <Badge bg="secondary">navratri</Badge>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default GlobalSearch;