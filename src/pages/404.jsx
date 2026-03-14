import React from 'react';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import { Home, ArrowLeft } from 'lucide-react';
import CustomBtn from '@/utils/CustomBtn';
import { useRouter } from 'next/router';

const Custom404 = () => {
    const router = useRouter();

    return (
        <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
            <Row className="text-center">
                <Col md={12}>
                    <div className="mb-4">
                        <img
                            src="/assets/images/event_page/404.webp"
                            alt="404 Not Found"
                            className="img-fluid floating-image"
                            style={{ maxWidth: '500px' }}
                        />
                    </div>

                    <div className="d-flex flex-wrap justify-content-center gap-3">
                        <CustomBtn
                            buttonText="Back to Previous"
                            icon={<ArrowLeft size={18} />}
                            HandleClick={() => router.back()}
                            variant="outline-info"
                            className="px-4 py-2"
                        />
                        <CustomBtn
                            buttonText="Go to Homepage"
                            icon={<Home size={18} />}
                            HandleClick={() => router.push('/')}
                            variant="primary"
                            className="px-4 py-2"
                        />
                    </div>
                </Col>
            </Row>

            <style jsx global>{`
                .floating-image {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </Container>
    );
};

Custom404.displayName = 'Custom404';

// Use default layout (Frontend) to maintain header/footer
Custom404.layout = 'Frontend';

export default Custom404;
