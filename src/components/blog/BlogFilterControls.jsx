import { Search } from "lucide-react";
import { memo } from "react";
import { Row, Col, InputGroup, Form, } from "react-bootstrap";
import Select from 'react-select';
import { InputWithIcon } from "@/utils/CustomComponent";

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
        <InputWithIcon
          icon={<Search className="icon" size={18} />}
          setData={setSearchTerm}
          value={searchTerm}
          placeholder="Search by title..."
        />
      </Col>

      <Col md={4}>
        <Select
          isMulti
          classNamePrefix="react-select"
          options={categoryOptions}
          placeholder="Filter by categories"
          value={selectedCategories}
          onChange={setSelectedCategories}
          isLoading={categoriesLoading}
        />
      </Col>

      <Col md={4}>
        <Select
          classNamePrefix="react-select"
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