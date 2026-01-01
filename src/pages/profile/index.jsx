import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useMyContext } from '@/Context/MyContextProvider';
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/auth/authSlice';
import toast from 'react-hot-toast';
import ProfileHeader from '../../components/events/Profile/ProfileHeader';
import UserProfileModal from '../../components/events/Profile/UserProfileModal';
import SupportOptions from '../../components/events/Profile/SupportOptions';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { UserData } = useMyContext();
  const dispatch = useDispatch();

  const requiredFields = ["photo",];

  // fetch user data
  const fetchUserData = async (id) => {
    const res = await api.get(`/user/profile`, {
      params: { fields: requiredFields.join(",") },
    });
    return res.data;
  };

  const {
    data: apiProfile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userData", UserData?.id],
    queryFn: ({ queryKey }) => fetchUserData(queryKey[1]),
    enabled: !!UserData?.id,
    staleTime: 1000 * 60 * 5,
  });

  // merge local user + API profile
  const profile = { ...(UserData || {}), ...(apiProfile?.user || apiProfile || {}) };

  // update user mutation
  const updateUserData = async (payload) => {
    let config = {};
    let data = payload;

    if (payload instanceof FormData) {
      config.headers = { "Content-Type": "multipart/form-data" };
    }

    const res = await api.post(`/update-user/${UserData?.id}`, data, config);
    return res.data;
  };

  const updateMutation = useMutation({
    mutationFn: updateUserData,
    onSuccess: (data) => {
      // Only update specific profile fields in Redux store
      if (data?.user) {
        const { name, email, number, photo } = data.user;
        dispatch(updateUser({ name, email, number, photo }));
      }
      refetch();
      toast.success("Profile updated");
      handleCloseEdit();
    },
    onError: () => toast.error("Update failed"),
  });

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "",
  });

  useEffect(() => {
    if (!isEditing) return;
    setFormValues({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });
  }, [isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((p) => ({ ...p, [name]: value }));
  };

  const handleEditClick = () => setIsEditing(true);
  const handleCloseEdit = () => setIsEditing(false);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formValues.name || !formValues.email) {
      toast.error("Name and Email are required");
      return;
    }

    updateMutation.mutate({
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
    });
  };

  useEffect(() => {
    if (apiProfile) {
      const payload = apiProfile?.user ? apiProfile.user : apiProfile;
      if (payload) {
        dispatch(updateUser(payload));
      }
    }
  }, [apiProfile, dispatch]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {String(error?.message || error)}</p>;

  return (
    <div>
      <ProfileHeader
        user={profile}
        onEditClick={handleEditClick}
        loading={updateMutation.isPending}
        onAvatarUpload={(formData) => updateMutation.mutate(formData)}
      />

      <UserProfileModal
        isEditing={isEditing}
        formValues={formValues}
        originalValues={{ name: profile?.name || "", email: profile?.email || "" }}
        handleChange={handleChange}
        handleCloseEdit={handleCloseEdit}
        handleEditSubmit={handleEditSubmit}
        updateMutation={updateMutation}
      />

      <Container className="p-0 pb-5">
        <SupportOptions />
      </Container>
    </div>
  );
};

export default UserProfile;
