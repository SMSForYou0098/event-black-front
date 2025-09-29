import React, { Fragment, memo, useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";

// components - grid card used here
import DetailMetaList from "../../components/blog/DetailMetaList";
import BlogFilterControls from "../../components/events/blogs/BlogFilterControls";
import PaginationComponent from "../../components/events/blogs/PaginationComponent";
import CardBlogGrid from "../../components/events/blogs/CardBlogGrid";
import CardBlogGridSkeleton from "../../utils/SkeletonUtils/blogs/CardBlogGridSkeleton";
// custom hooks / api
import { useBreadcrumb } from "@/utilities/usePage";
import { publicApi } from "@/lib/axiosInterceptor";

// Sort options
const sortOptions = [
  { label: "Latest", value: "desc" },
  { label: "Oldest", value: "asc" },
  { label: "Title A-Z", value: "title-asc" },
  { label: "Title Z-A", value: "title-desc" },
];

const GRID_LIMIT = 9; // 3 x 3

const BLogs = memo(() => {
  // useBreadcrumb?.("Blog List");

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState(sortOptions[0]);

  // Fetch all blogs using TanStack Query
  const {
    data: allBlogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      // const res = await publicApi.get(`/blog-status`);
      const res = await publicApi.get(`/blogs`);
      if (!res?.data?.status) {
        throw new Error(res?.data?.message || "Failed to fetch blogs");
      }
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Client-side filtering, sorting and pagination
  const { filteredBlogs, paginatedBlogs, totalPages } = useMemo(() => {
    if (!allBlogs.length) {
      return { filteredBlogs: [], paginatedBlogs: [], totalPages: 0 };
    }

    // Filter by search term
    let filtered = allBlogs;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(blog => 
        blog.title?.toLowerCase().includes(searchLower) ||
        blog.description?.toLowerCase().includes(searchLower) ||
        blog.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      const selectedCategoryIds = selectedCategories.map(cat => cat.value);
      filtered = filtered.filter(blog => 
        blog.categories?.some(cat => 
          selectedCategoryIds.includes(cat.id) || selectedCategoryIds.includes(cat.value)
        )
      );
    }

    // Sort blogs
    filtered = [...filtered]; // Create a copy to avoid mutating original array
    switch (sortOrder.value) {
      case "desc":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "asc":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "title-asc":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title-desc":
        filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      default:
        // Default to latest first
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Pagination
    const startIndex = (currentPage - 1) * GRID_LIMIT;
    const paginated = filtered.slice(startIndex, startIndex + GRID_LIMIT);
    const totalPages = Math.ceil(filtered.length / GRID_LIMIT);

    return {
      filteredBlogs: filtered,
      paginatedBlogs: paginated,
      totalPages
    };
  }, [allBlogs, searchTerm, selectedCategories, sortOrder, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, sortOrder]);

  // Fetch categories
  const fetchCategories = async () => {
    const res = await publicApi.get("/category");
    const data = res?.data || {};
    const arr = Array.isArray(data.categoryData) ? data.categoryData : Array.isArray(data.data) ? data.data : [];
    return arr.map((cat) => ({ label: cat.title, value: cat.id }));
  };

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Page change handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Map categories safely to strings for each blog
  const normalizedBlogs = paginatedBlogs.map((b) => ({
    ...b,
    //categoryTitles: (b.categories || []).map((c) => c?.title ?? c?.label ?? String(c)),
  }));



  return (
    <Fragment>
      <div className="section-padding">
        <Container>
          {/* Filter Controls - Always visible, not affected by loading state */}
          <BlogFilterControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryOptions={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            sortOptions={sortOptions}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            disabled={isLoading}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            onRetryCategories={refetchCategories}
          />

          <Row>
            <Col lg={12} sm={12}>
              {/* Blog Grid Area with Isolated Loading State */}
              <div className="position-relative">
                {/* Loading Overlay - Only covers the blog grid area */}
                {isLoading && (
                  <CardBlogGridSkeleton count={9} columns={3} />
                )}

                {/* Error message */}
                {error && (
                  <Alert variant="danger" className="d-flex justify-content-between align-items-center">
                    <span>{error?.message || "Failed to load blogs"}</span>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => refetch()}
                    >
                      Retry
                    </button>
                  </Alert>
                )}

                {/* Grid (3x3) */}
                <Row>
                  {!isLoading && normalizedBlogs.length > 0 ? (
                    normalizedBlogs.map((item, idx) => (
                      <Col lg={4} md={6} sm={12} key={item.id ?? `blog-${idx}`}>
                        <CardBlogGrid
                          title={item.title}
                          content={item.content_length}
                          thumbnail={item.thumbnail}
                          description={item.description || item.excerpt || ""}
                          username={item.user_data?.name || item.username || "Unknown"}
                          date={item.created_at}
                          categories={item.categories}
                          id={item?.id}
                        />
                      </Col>
                    ))
                  ) : !isLoading ? (
                    <Col>
                      <Alert variant="warning" className="text-center">No blogs found.</Alert>
                    </Col>
                  ) : null}
                </Row>

                {/* Pagination (frontend only) */}
                {!isLoading && totalPages > 1 && (
                  <div className="mt-3">
                    <PaginationComponent 
                      currentPage={currentPage} 
                      totalPages={totalPages} 
                      onPageChange={handlePageChange}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            </Col>

            {/* Sidebar - Always visible */}
            {/* <Col lg={4} sm={12}>
              <DetailMetaList />
            </Col> */}
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

BLogs.displayName = "BLogs";
export default BLogs;