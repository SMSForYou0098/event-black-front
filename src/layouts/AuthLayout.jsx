import React from "react";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import Logo from "@/components/partials/Logo";
const AuthLayout = ({ children }) => {
  const { systemSetting } = useMyContext();
  return (
    <main className="main-content">
      <div
        className="vh-100"
        style={{
          backgroundImage: "url(/assets/images/pages/01.webp)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          position: "relative",
          minHeight: "500px",
        }}
      >
        <Container>
          <Row className="justify-content-center align-items-center height-self-center vh-100">
            <Col lg="5" md="12" className="align-self-center">
              <Card className="user-login-card p-4 card-glassmorphism">
                <div className="text-center">
                  <Logo height={50} width={80} />
                </div>
                {children}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </main>
  );
};

export default AuthLayout;
