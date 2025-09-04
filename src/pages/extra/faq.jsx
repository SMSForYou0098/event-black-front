import { Fragment, memo, useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { publicApi } from "@/lib/axiosInterceptor";

// React Bootstrap
import { Col, Container, Row, Spinner } from "react-bootstrap";

// Custom Hook
import { useBreadcrumb } from "@/utilities/usePage";

const FAQPage = memo(() => {
  // State to manage which accordion item is currently open
  const [activeId, setActiveId] = useState(null);

  // useBreadcrumb('FAQ');

  // Data fetching logic using React Query
  const {
    data: faqs = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await publicApi.get(`faq-list`);
      if (response.data.status) {
        return response.data.data.filter(faq => faq.is_active);
      } else {
        throw new Error(response.data.message || "No FAQs available");
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    onSuccess: (data) => {
      // Set the first FAQ item to be open by default after data is loaded
      if (data.length > 0 && activeId === null) {
        setActiveId(data.id);
      }
    },
    onError: (error) => {
      console.error("Error fetching FAQs:", error);
      // ErrorAlert(error.response?.data?.message || "Failed to fetch FAQs");
    }
  });

  // Get unique categories from the data
  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    faqs.forEach(faq => {
      if (faq.category_data && !uniqueCategories.has(faq.category_data.id)) {
        uniqueCategories.set(faq.category_data.id, { 
          id: faq.category_data.id, 
          title: faq.category_data.title 
        });
      }
    });
    return Array.from(uniqueCategories.values());
  }, [faqs]);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="section-padding">
        <Container>
          <Row>
            <Col lg="12" sm="12">
              <div className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="section-padding">
        <Container>
          <Row>
            <Col lg="12" sm="12">
              <div className="text-center text-danger">
                Error: {error.message}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Function to toggle accordion items
  const toggleAccordion = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <Fragment>
      <div className="section-padding">
        <Container>
          <Row>
            <Col lg="12" sm="12">
              {/* Map over categories to create sections */}
              {categories.map(category => (
                <div key={category.id} className="mb-5">
                  <h2 className="mb-4 text-center fs-5">{category.title}</h2>
                  <div className="iq-accordian iq-accordian-square">
                    {/* Filter and map over faqs for the current category */}
                    {faqs.filter(faq => faq.category === category.id.toString()).map(faqItem => (
                      <div
                        key={faqItem.id}
                        className={`iq-accordian-block ${activeId === faqItem.id ? "iq-active" : ""}`}
                        onClick={() => toggleAccordion(faqItem.id)}
                      >
                        <div className="iq-accordian-title">
                          <div className="iq-icon-right">
                            <i aria-hidden="true" className="fa fa-minus active"></i>
                            <i aria-hidden="true" className="fa fa-plus inactive"></i>
                          </div>
                          <h4 className="mb-0 accordian-title iq-heading-title fs-6">
                            {faqItem.question}
                          </h4>
                        </div>
                        <div
                          className={`iq-accordian-details ${activeId === faqItem.id ? "d-block" : "d-none"}`}
                        >
                          <p className="mb-0 fs-6">
                            {faqItem.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Fallback: If no categories, show all FAQs */}
              {categories.length === 0 && faqs.length > 0 && (
                <div className="iq-accordian iq-accordian-square">
                  {faqs.map(faqItem => (
                    <div
                      key={faqItem.id}
                      className={`iq-accordian-block ${activeId === faqItem.id ? "iq-active" : ""}`}
                      onClick={() => toggleAccordion(faqItem.id)}
                    >
                      <div className="iq-accordian-title">
                        <div className="iq-icon-right">
                          <i aria-hidden="true" className="fa fa-minus active"></i>
                          <i aria-hidden="true" className="fa fa-plus inactive"></i>
                        </div>
                        <h4 className="mb-0 accordian-title iq-heading-title fs-6">
                          {faqItem.question}
                        </h4>
                      </div>
                      <div
                        className={`iq-accordian-details ${activeId === faqItem.id ? "d-block" : "d-none"}`}
                      >
                        <p className="mb-0 fs-6">
                          {faqItem.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No FAQs available message */}
              {faqs.length === 0 && (
                <div className="text-center">
                  <p className="fs-6">No FAQs available at the moment.</p>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

FAQPage.displayName = "FAQPage";
export default FAQPage;
