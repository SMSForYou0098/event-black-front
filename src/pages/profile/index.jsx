import React, { useState, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Ticket, Gift, Star, Users } from 'lucide-react';
import ProfileHeader from '../../components/events/Profile/ProfileHeader';
import OverviewTab from '../../components/events/Profile/OverviewTab';
import TabNavigation from '../../components/events/Profile/TabNavigation';
import BookingsTab from '../../components/events/Profile/BookingsTab';
import RewardsTab from '../../components/events/Profile/RewardsTab';
import { useMyContext } from '@/Context/MyContextProvider';

const useUserData = () => {
  const { UserData } = useMyContext();
  return useMemo(() => ({
    user: {
      name: UserData?.name,
      email: UserData?.email,
      phone: UserData?.number,
      avatar: UserData?.photo,
      verified: true,
      totalBookings: 47,
      totalSpent: 1240,
      city: UserData?.city
    },
    bookings: [
      {
        id: '1',
        title: 'Spider-Man: No Way Home',
        type: 'movie',
        venue: 'AMC Empire 25',
        date: '2024-01-15',
        time: '7:30 PM',
        seats: ['H7', 'H8'],
        status: 'confirmed',
        amount: 28,
        poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
        rating: 4.5
      },
      {
        id: '2',
        title: 'Coldplay World Tour',
        type: 'concert',
        venue: 'Madison Square Garden',
        date: '2024-01-10',
        time: '8:00 PM',
        seats: ['A12', 'A13'],
        status: 'completed',
        amount: 180,
        poster: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
        rating: 5
      },
      {
        id: '3',
        title: 'The Lion King',
        type: 'event',
        venue: 'Broadway Theatre',
        date: '2024-01-05',
        time: '2:00 PM',
        seats: ['M15', 'M16'],
        status: 'completed',
        amount: 95,
        poster: 'https://images.pexels.com/photos/3137890/pexels-photo-3137890.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
        rating: 4.8
      },
      {
        id: '4',
        title: 'Lakers vs Warriors',
        type: 'sports',
        venue: 'Crypto.com Arena',
        date: '2024-01-02',
        time: '7:00 PM',
        seats: ['Section 101, Row 5'],
        status: 'cancelled',
        amount: 240,
        poster: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'
      },
    ],
    rewards: [
      { id: 1, title: 'Free Movie Ticket', description: 'Valid for any movie', points: 500, icon: Ticket, bgColor: 'rgba(220, 53, 69, 0.2)', iconColor: 'text-danger' },
      { id: 2, title: '$10 Food Voucher', description: 'Use at any cinema', points: 300, icon: Gift, bgColor: 'rgba(25, 135, 84, 0.2)', iconColor: 'text-success' }
    ],
    pointsHistory: [
      { id: 1, action: 'Movie Booking', details: 'Spider-Man: No Way Home', points: 50, type: 'earned' },
      { id: 2, action: 'Review Posted', details: 'The Lion King', points: 25, type: 'earned' },
      { id: 3, action: 'Redeemed Reward', details: 'Free Movie Ticket', points: 500, type: 'spent' }
    ],
    monthlyStats: [
      { label: '3 Bookings', sublabel: 'This month', icon: Ticket, bgColor: 'rgba(220, 53, 69, 0.2)', iconColor: 'text-danger', trending: true },
      { label: '4.8 Rating', sublabel: 'Average given', icon: Star, bgColor: 'rgba(25, 135, 84, 0.2)', iconColor: 'text-success' },
      { label: '12 Friends', sublabel: 'Invited', icon: Users, bgColor: 'rgba(13, 110, 253, 0.2)', iconColor: 'text-primary' }
    ]
  }), []);
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const { user, bookings, rewards, pointsHistory, monthlyStats } = useUserData();
  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab recentBookings={recentBookings} user={user} monthlyStats={monthlyStats} />;
      case 'bookings':
        return <BookingsTab bookings={bookings} />;
      // case 'wishlist':
      //   return <WishlistTab />;
      case 'rewards':
        return <RewardsTab rewards={rewards} pointsHistory={pointsHistory} />;
      // case 'settings':
      //   return <SettingsTab />;
      default:
        return <OverviewTab recentBookings={recentBookings} user={user} monthlyStats={monthlyStats} />;
    }
  };

  return (
    <div className='section-padding'>
      <ProfileHeader user={user} onEditClick={() => setIsEditing(!isEditing)} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <Container className="pb-5">
        {renderTabContent()}
      </Container>
    </div>
  );
};

export default UserProfile;