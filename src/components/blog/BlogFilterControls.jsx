import { memo } from "react";
import {  Row, Col,   InputGroup, Form,  } from "react-bootstrap";
import Select from 'react-select';

// Blog Filter Controls Component
const BlogFilterControls = memo(({
  searchTerm,
  setSearchTerm,
  categoryOptions,
  selectedCategories,
  setSelectedCategories,
  sortOptions,
  sortOrder,
  setSortOrder,
  categoriesLoading,
}) => {
  return (
    <Row className="g-3 align-items-center mb-4">
      <Col md={4}>
        <InputGroup className="shadow-sm rounded-3 overflow-hidden">
          <Form.Control
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 py-2 px-3"
          />
          <InputGroup.Text
            className="bg-white border-0"
          >
            {/* <i className="bi bi-search"></i> */}
          </InputGroup.Text>
        </InputGroup>
      </Col>

      <Col md={4}>
        <Select
          isMulti
          options={categoryOptions}
          placeholder="Filter by categories"
          value={selectedCategories}
          onChange={setSelectedCategories}
          isLoading={categoriesLoading}
        />
      </Col>

      <Col md={4}>
        <Select
          options={sortOptions}
          value={sortOrder}
          onChange={setSortOrder}
          placeholder="Sort by"
        />
      </Col>
    </Row>
  );
});

BlogFilterControls.displayName = "BlogFilterControls";
export default BlogFilterControls