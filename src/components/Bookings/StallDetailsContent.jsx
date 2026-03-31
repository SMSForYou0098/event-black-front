import React from 'react';
import { Ticket, Pin, Tag, Info } from 'lucide-react';
import { CardContainer, CardHeader, DetailItem } from '@/utils/EventCardUtils';
import { MobileAndTablet } from '@/utils/ResponsiveRenderer';
import CustomBtn from '@/utils/CustomBtn';
import MobileTwoButtonFooter from '@/utils/MobileTwoButtonFooter';

const StallDetailsContent = ({ stall, onBook, onCancel, eventDetails = [] }) => (
  <div className="d-flex flex-column mb-5 h-100 text-white">
    <div className="flex-grow-1 overflow-auto">
      <CardContainer>
        <DetailItem
          icon={Pin}
          label="Stall Name"
          value={stall?.meta?.name || 'Unnamed Stall'}
        />
        <DetailItem
          icon={Tag}
          label="Stall Price"
          value={stall?.meta?.price ? `₹${stall.meta.price}` : 'Free'}
          isLast={true}
        />
      </CardContainer>
      <MobileAndTablet>
        <CardContainer className="border-0">
          <CardHeader
            icon={Ticket}
            title="Event Details"
            iconColor="text-warning"
          />
          {eventDetails.map((detail, index) => (
            <DetailItem
              key={detail.label}
              icon={detail.icon}
              label={detail.label}
              value={detail.value}
              isLast={index === eventDetails.length - 1}
            />
          ))}
          <hr className="border-secondary my-4" />
        </CardContainer>
      </MobileAndTablet>
    </div>

    <MobileTwoButtonFooter
      leftButton={
        <CustomBtn
          variant="secondary"
          buttonText="Cancel"
          HandleClick={onCancel}
          hideIcon={true}
          className="w-100"
          wrapperClassName="flex-grow-1"
        />
      }
      rightButton={
        <CustomBtn
          variant="primary"
          buttonText="Start Booking"
          HandleClick={onBook}
          hideIcon={true}
          className="w-100"
          wrapperClassName="flex-grow-1"
        />
      }
    />
  </div>
);

export default StallDetailsContent;
