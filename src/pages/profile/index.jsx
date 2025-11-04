import { useState, useMemo, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Ticket, Gift, Star, Users } from 'lucide-react';
import ProfileHeader from '../../components/events/Profile/ProfileHeader';
import OverviewTab from '../../components/events/Profile/OverviewTab';
import TabNavigation from '../../components/events/Profile/TabNavigation';
import BookingsTab from '../../components/events/Profile/BookingsTab';
import RewardsTab from '../../components/events/Profile/RewardsTab';
import { useMyContext } from '@/Context/MyContextProvider';
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/auth/authSlice'
import toast from 'react-hot-toast';
import UserProfileModal from '../../components/events/Profile/UserProfileModal';
import SupportOptions from '../../components/events/Profile/SupportOptions';

const useUserData = () => {
  const { UserData, ErrorAlert } = useMyContext();
  return useMemo(() => ({
    user: {
      name: UserData?.name,
      id: UserData?.id,
      email: UserData?.email,
      phone: UserData?.number,
      avatar: UserData?.photo,
      verified: true,
      totalBookings: 47,
      totalSpent: 1240,
      city: UserData?.city
    },
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

  const requiredFields = [
    "id",
    "name",
    "number",
    "photo",
    "email",
  ];

  const { user, rewards, pointsHistory, monthlyStats } = useUserData();

  const dispatch = useDispatch();

  // fetching user data
  const fetchUserData = async (id) => {
    const res = await api.get(`/edit-user/${id}`, {
      params: {
        fields: requiredFields.join(","),
      },
    });
    return res.data;
  };

  const {
    data: apiProfile,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["userData", user?.id],
    queryFn: ({ queryKey }) => fetchUserData(queryKey[1]),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  // merge local user + API profile consistently
  const profile = { ...(user || {}), ...(apiProfile?.user || apiProfile || {}) };
  // ---- Mutation: update user (for both avatar & profile fields) ----

  // booking summary

  const fetchUserBookings = async (id) => {
    const res = await api.get(`/user-bookings/${id}`);
    return res.data;
  };

  const {
    data: userBookings,
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
    error: bookingsError,
    refetch: refetchBookings,
    isFetching: isFetchingBookings,
  } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: ({ queryKey }) => fetchUserBookings(queryKey[1]),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // updateding user
  const updateUserData = async (payload) => {
    let config = {};
    let data = payload;

    // If payload is FormData (avatar upload), set headers
    if (payload instanceof FormData) {
      config.headers = { "Content-Type": "multipart/form-data" };
    }

    const res = await api.post(`/update-user/${user?.id}`, data, config);
    return res.data;
  };

  const updateMutation = useMutation({
    mutationFn: updateUserData,
    onSuccess: (res) => {
      refetch();
      toast.success("Profile updated");
      handleCloseEdit();
    },
    onError: (err) => {
      toast.error("Update failed");
    },
  });

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    photo:'',
  });

  // populate form when opening edit modal
  useEffect(() => {
    if (!isEditing) return;
    // we already set initial values in handleEditClick, but keep this guard if modal
    // might open via other flows; avoid depending on `profile` so input edits aren't overwritten.
    setFormValues({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });
    // run only when isEditing toggles
  }, [isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((p) => ({ ...p, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    // basic validation
    if (!formValues.name || !formValues.email) {
      toast.error("Name and Email are required");
      return;
    }

    // send plain JSON payload for profile fields
    updateMutation.mutate({
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
    });
  };



  useEffect(() => {
    if (apiProfile) {
      // The API might return the user directly or inside an object (e.g. { user: {...} })
      const payload = apiProfile?.user ? apiProfile.user : apiProfile;
      if (payload) {
        // Dispatch the updateUser reducer to merge new fields into auth.user
        dispatch(updateUser(payload));
      }
    }
  }, [apiProfile, dispatch]);

    const recentBookings = useMemo(() => userBookings?.bookings?.slice(0, 3), [userBookings?.bookings]);


  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab recentBookings={recentBookings} user={user} monthlyStats={monthlyStats} />;
      case 'bookings':
        return <BookingsTab bookings={userBookings?.bookings} userBookings={userBookings?.bookings ?? userBookings ?? []} loading={isLoadingBookings} />;
      // case 'wishlist':
      //   return <WishlistTab />;
      case 'rewards':
        return <RewardsTab rewards={rewards} pointsHistory={pointsHistory} />;
      case 'support':
        return <SupportOptions  />;
      // case 'settings':
      //   return <SettingsTab />;
      default:
        return <OverviewTab recentBookings={recentBookings} user={user} monthlyStats={monthlyStats} />;
    }
  };
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {String(error?.message || error)}</p>;

  return (
    <div>
      <ProfileHeader user={profile} onEditClick={handleEditClick} loading={updateMutation.isPending} onAvatarUpload={(formData) => updateMutation.mutate(formData)}
      />
      <UserProfileModal
        isEditing={isEditing}
        formValues={formValues}
        handleChange={handleChange}
        handleCloseEdit={handleCloseEdit}
        handleEditSubmit={handleEditSubmit}
        updateMutation={updateMutation}
      />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <Container className="pb-5">{renderTabContent()}</Container>
    </div>
  );
};

export default UserProfile;