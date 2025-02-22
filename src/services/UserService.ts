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

  followUser: async (followerId: number, followedId: number) => {
    const response = await axiosInstance.post(
      `/profiles/${followerId}/follow/${followedId}`
    );
    return response.data;
  },

  unfollowUser: async (followerId: number, followedId: number) => {
    const response = await axiosInstance.post(
      `/profiles/${followerId}/unfollow/${followedId}`
    );
    return response.data;
  },

  userFollowed: async (followerId: number, followedId: number) => {
    const response = await axiosInstance.get(
      `/profiles/${followerId}/followed/${followedId}`
    );
    return response.data;
  },

  isFriend: async (userId: number, friendId: number) => {
    const response = await axiosInstance.get(
      `/profiles/${userId}/friends/${friendId}`
    );
    return response.data;
  },

  searchUsers: async (searchTerm: string) => {
    const response = await axiosInstance.get(`/search?term=${searchTerm}`);
    console.log(response.data);
    return response.data;
  },

  fetchFriends: async (userId: number, page: number) => {
    const response = await axiosInstance.get(
      `http://localhost:8080/api/profiles/${userId}/friends`,
      {
        params: { page, size: 20 },
      }
    );
    return response.data;
  },

  fetchPotentialFriends: async (userId: number, page: number) => {
    const response = await axiosInstance.get(
      `http://localhost:8080/api/${userId}/friends/potential`,
      {
        params: { page, size: 20 },
      }
    );
    return response.data;
  },
};

export default UserService;
