import * as moment from 'moment';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';


const Ticket1 = ({ terms, category, title, date, city, address, time, ticketName, backgroundImage, OrderId,quantity }) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  useEffect(() => {
    if (date && date?.length === 0) return;
    if (date !== undefined) {
      let formattedDates;
      if (date && date?.length === 2 && moment(date[0]).isSame(date[1], 'day')) {
        formattedDates = moment(date[0]).format('D MMM');
      } else if (date?.length === 2) {
        const startDate = moment(date[0]).format('D MMM');
        const endDate = moment(date[1]).format('D MMM');
        formattedDates = `${startDate} - ${endDate}`;
      }
      setFormattedDate(formattedDates);
    }
  }, [date]);

  useEffect(() => {
    if (backgroundImage) {
      const file = backgroundImage;
      // Create a temporary URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  }, [backgroundImage])



  return (
    <Container fluid>
      <Row className="text-white overflow-hidden" style={{ maxWidth: '800px', height: '300px' }}>
        <Col xs={12} md={9} className="p-0 position-relative" style={{ height: '100%' }}>
          <Image
            src={`${previewImage ? previewImage : 'https://via.placeholder.com/800x300'}`}
            alt="Concert crowd with stage lights"
            className="img-fluid w-100 h-100"
            style={{
              objectFit: 'cover',
              minHeight: '300px'
            }}
          />
          <div style={{ height: '100%' }} className="position-absolute top-0 left-0 w-100  bg-black bg-opacity-50 p-4 d-flex flex-column justify-content-between">
            <div className='position-relative' style={{ bottom: '4%' }}>
              <p className="small">{category}</p>
              <h3 className="font-weight-bold text-white">{title}</h3>
              <div className="d-flex justify-content-between align-items-center">
                <p className="h4 text-warning">{formattedDate}</p>

              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              {OrderId ?
                  <QRCodeSVG
                    size={256}
                    style={{ height: "auto", width: "13%",background:'#fff',padding:'3px' }}
                    value={OrderId}
                    viewBox={`0 0 256 256`}
                  />
                :
                <Image
                  src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLdjwMSIcdiXZ9YZSlodp8zciidFykXvMR9dhyLg0ZesO5R_ncCt7zX492Q1V5LrgMCSQ&usqp=CAU`}
                  alt="Concert crowd with stage lights"
                  className="img-fluid"
                  style={{ width: '6rem' }}
                />
              }
              <div className='d-flex flex-column'>
              <p className="h4 text-white">{ticketName}</p>
              <p className="text-white"><>QTY : </>{quantity?quantity:1}</p>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <p className="small mb-0">{address}</p>
                  <p className="small fw-bold">{city}</p>
                </div>

              </div>
              <div className="">
                <p className="small mb-0 fw-bold">Event Start Time</p>
                <p className="small">{time}</p>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={12} md={1} className="bg-dark p-0 m-0 d-none d-md-flex flex-column align-items-center justify-content-between" style={{ width: '5px', height: '100%' }}>
          <div className="w-100 d-flex flex-column justify-content-center align-items-center">
            {Array.from({ length: 35 }).map((_, index) => (
              <div
                key={index}
                className="bg-white"
                style={{ width: '7px', height: '7px', margin: '2px 0', borderRadius: '100px' }}
              ></div>
            ))}
          </div>
        </Col>
        <Col xs={12} md={2} className="bg-light d-flex flex-column align-items-center justify-content-between p-2 text-dark overflow-hidden" style={{ height: '100%' }}>
          
          <div className='terms d-flex justify-content-center align-items-center' style={{ height: '100%' }}>
            <h5 className='m-0 p-0' style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Terms & Condition</h5>
            <p className="m-0 small text-justify" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{terms}</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Ticket1;