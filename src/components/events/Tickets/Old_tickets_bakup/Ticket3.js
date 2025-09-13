import React from 'react';
import {QRCodeSVG} from "qrcode.react";
import { useMyContext } from '../../../../../Context/MyContextProvider';



const Ticket3 = ({ terms, category, title, date, city, address, time, ticketName, backgroundImage, OrderId, quantity, documentId, ticketBG }) => {
  const { isMobile } = useMyContext();
  const styles = {
    ticket: {
      display: 'flex',
      backgroundColor: '#111',
      color: 'white',
      width: isMobile ? '600px' : '100%',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
      position: 'relative',
      padding: 0,
    },
    ticketLeft: {
      backgroundImage: `url(${ticketBG})`,
      backgroundSize: 'cover',
      padding: '10px',
      flexGrow: 1,
      position: 'relative',
    },
    ticketInfo: {
      padding: '10px',
    },
    concertTitle: {
      color: 'white',
      marginBottom: '10px',
    },
    venue: {
      margin: '5px 0',
    },
    dateTime: {
      fontSize: '0.8rem',
      margin: '5px 0',
    },

    ticketRight: {
      backgroundColor: '#222',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '150px',
      position: 'relative',
    },
    ticketDetail: {
      margin: '10px 0',
      fontSize: '0.8em',
    },
    admitOne: {
      margin: '20px 0',
      fontSize: '1.5em',
      fontWeight: 'bold',
    },
    barcode: {
      width: '100%',
      height: '50px',
      backgroundColor: '#444',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontSize: '1em',
      borderRadius: '5px',
    },
    dottedLine: {
      width: '1px',
      backgroundImage: 'linear-gradient(to bottom, transparent 50%, white 50%)',
      backgroundSize: '1px 10px',
    }
  };
  return (
    <div className='d-flex'>
      <div className='d-flex p-0 m-0 text-white' style={styles.ticketLeft}>
        <div className='main w-100' style={styles.ticketInfo}>
          <h4 style={styles.concertTitle}><br /><br /></h4>

          <div className='qr text-center'>
            <div className='d-flex justify-content-center gap-3 align-items-center mt-5' style={{ marginBottom: '7rem', position: 'relative', top: '3rem' }}>
              <div className='dates'>
                <p className='p-0 m-0'>{ticketName}</p>
                <p className='p-0'>QTY: {quantity}</p>
              </div>
              <div className='qr'>
                <QRCodeSVG
                  id={documentId}
                  value={OrderId || 'a'}
                  size={90}
                  bgColor="#FFF"
                  fgColor="#000"
                  includeMargin
                  level={"H"}
                />
              </div>
              <div className='dates'>
                <p style={styles?.dateTime}><strong>Date</strong>: {date}</p>
                <p className='d-flex' style={styles?.dateTime}><strong>Time</strong>: {time}</p>
              </div>
            </div>
          </div>
          <div className='content mt-3'>
            <div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket3;

