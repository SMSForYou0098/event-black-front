import React from 'react';
import {QRCodeSVG} from 'qrcode.react';

const MobileTicket = ({ ticketName, quantity, date, time, documentId, OrderId, ticketBG }) => {
  const styles = {
    ticketContainer: {
      display: 'flex',
    },
    ticketWrapper: {
      backgroundImage: `url(${ticketBG})`,
      backgroundSize: 'cover',
      flexGrow: 1,
      position: 'relative',
    },
    mainContent: {
      fontSize: '9px',
      width: '100%',
    },
    heading: {
      color: 'white',
    },
    qrContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    //   marginTop: '5rem',
      position: 'relative',
      left: '25px',
      bottom: '15px',
      gap: '3px',
    },
    datesContainer: {
      fontSize: '0.5rem',
    },
    qrCodeStyle: {
      height: '40px',
      width: '40px',
    },
    dateText: {
      fontSize: '0.5rem',
      margin: '5px 0px',
    },
    timeText: {
      fontSize: '0.5rem',
      margin: '5px 0px',
    },
  };

  return (
    <div style={styles.ticketContainer}>
      <div className="d-flex p-0 m-0 text-white" style={styles.ticketWrapper}>
        <div className="main" style={styles.mainContent}>
          <h4 style={styles.heading}>
            <br />
            <br />
          </h4>
          <div className="qr text-center">
            <div style={styles.qrContainer}>
              <div style={styles.datesContainer}>
                <p className="p-0 m-0">{ticketName}</p>
                <p className="p-0">QTY: {quantity}</p>
              </div>
              <div className="qr">
                <QRCodeSVG
                  id={documentId}
                  value={OrderId || 'a'}
                  size={180}
                  style={styles.qrCodeStyle}
                  bgColor="#FFF"
                  fgColor="#000"
                  includeMargin
                  level={"H"}
                />
              </div>
              <div style={styles.datesContainer}>
                <p style={styles.dateText}>
                  <strong>Date</strong>: {date}
                </p>
                <p className="d-flex" style={styles.timeText}>
                  <strong>Time</strong>: {time}
                </p>
              </div>
            </div>
          </div>
          <div className="content mt-3">
            <div>
              {/* Additional content here if needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTicket;
