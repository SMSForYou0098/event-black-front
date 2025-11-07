import React from "react";
import { Col, Image, Row } from "react-bootstrap";
import { useMyContext } from "../Context/MyContextProvider";

const LoaderComp = ({ imgLoader }) => {
  const { loader } = useMyContext();

  return (
    <Row className="bg-transparent justify-content-center text-center">
      <Col xs={12} className="p-0 bg-transparent">
        <Image
          src={imgLoader || '/assets/stock/loader111.gif'}
          alt="loader"
          className="img-fluid bg-transparent shadow-none"
          style={{
            height: imgLoader ? "300px" : "100px",
            objectFit: "contain"
          }}
        />
      </Col>
    </Row>
  );
};

export default LoaderComp;
