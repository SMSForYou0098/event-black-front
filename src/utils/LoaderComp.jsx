import React from "react";
import { Col, Image, Row } from "react-bootstrap";
import { useMyContext } from "../Context/MyContextProvider";
const LoaderComp = ({imgLoader}) => {
  const { loader } = useMyContext();
  return (
    <Row className="bg-transparent">
      <Col xs={24} className="p-0 bg-transparent">
        <Image
          src={imgLoader || loader}
          alt="loader"
          className="img-fluid bg-transparent shadow-none"
          style={{
            height: imgLoader ? '300px' : '100px'
          }}
        //   style={{ width: "100%", height: "auto" }}
        />
      </Col>
    </Row>
  );
};

export default LoaderComp;
