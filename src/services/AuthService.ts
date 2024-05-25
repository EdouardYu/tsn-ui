// src/services/AuthService.ts
import axios from "axios";

interface SignUpFormData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  birthday: string;
  gender: string;
  nationality: string;
  interests: string[];
}

interface SignInFormData {
  email: string;
  password: string;
}

interface ResetPasswordFormData {
  email: string;
  password: string;
  code: string;
}

const AuthService = {
  signup: async (formData: SignUpFormData) => {
    await axios.post("http://localhost:8080/api/signup", formData);
  },

  activate: async (email: string, code: string) => {
    await axios.post("http://localhost:8080/api/activate", {
      email,
      code,
    });
  },

  resendActivationCode: async (email: string) => {
    await axios.post("http://localhost:8080/api/activate/new", { email });
  },

  signin: async (formData: SignInFormData) => {
    const response = await axios.post(
      "http://localhost:8080/api/signin",
      formData
    );
    return response.data;
  },

  sendResetPasswordEmail: async (email: string) => {
    await axios.post("http://localhost:8080/api/password/reset", { email });
  },

  resetPassword: async (formData: ResetPasswordFormData) => {
    await axios.post("http://localhost:8080/api/password/new", formData);
  },
};

export default AuthService;
