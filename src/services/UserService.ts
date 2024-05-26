import axiosInstance from "@/services/axiosConfig";

interface ProfileData {
  firstname: string;
  lastname: string;
  username: string;
  birthday: string;
  gender: string;
  nationality: string;
  picture: string;
  bio: string;
  visibility: string;
  interests: string[];
}

interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

const UserService = {
  updateProfile: async (id: string | undefined, profileData: ProfileData) => {
    const response = await axiosInstance.put(`/profiles/${id}`, profileData);
    return response.data;
  },

  changePassword: async (
    id: string | undefined,
    passwordData: ChangePasswordData
  ) => {
    await axiosInstance.put(`/profiles/${id}/password`, passwordData);
  },

  getProfile: async (id: string | undefined) => {
    const response = await axiosInstance.get(`/profiles/${id}`);
    return response.data;
  },

  getOptions: async (filters?: string[]) => {
    const filterParam = filters ? filters.join(",") : "";
    const response = await axiosInstance.get(
      `/options${filterParam ? `?filters=${filterParam}` : ""}`
    );
    return response.data;
  },
};

export default UserService;
