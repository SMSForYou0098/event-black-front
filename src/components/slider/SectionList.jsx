import React from "react";

// react-bootstrap
import { Container, Row, Col } from "react-bootstrap";

// Next-Link
import Link from "next/link";

// Redux selector
import { useSelector } from "react-redux";
import { theme_scheme_direction } from "../../store/setting/selectors";

const SectionList = ({
  children,
  title,
  list = [],
  className = "",
  link,
  containerFluid = true,
  onViewAll,
  columns = 6, // roughly similar to slidesPerView
  hideViewAll=false,
}) => {
  const themeSchemeDirection = useSelector(theme_scheme_direction);

  // Calculate bootstrap column size based on desired columns (like slidesPerView)
  const getColSize = () => {
    if (columns >= 6) return 2; // 6 per row
    if (columns === 4) return 3; // 4 per row
    if (columns === 3) return 4; // 3 per row
    return 6; // default 2 per row
  };

  const colSize = getColSize();
  console.log('fff',hideViewAll);
  return (
    <div className={className}>
      <Container fluid={containerFluid}>
        <div className="overflow-hidden card-style-slider">
          <div className="d-flex align-items-center justify-content-between px-3 my-2">
            <h5 className="main-title text-capitalize mb-0">{title}</h5>
            {
                hideViewAll !==false && 
            <Link
              href={onViewAll ? onViewAll : "/view-all"}
              className="text-primary iq-view-all text-decoration-none"
            //   onClick={onViewAll}
            >
              View All
            </Link>
            }
          </div>

          <Row className="gx-2 gy-3 px-3">
            {list?.map((data, index) => (
              <Col
                key={index}
                xs={6}
                sm={6}
                md={4}
                lg={colSize}
                xl={colSize}
                className="d-flex"
              >
                {children(data)}
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
};

SectionList.displayName = "SectionList";

export default SectionList;
