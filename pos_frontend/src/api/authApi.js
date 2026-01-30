import axiosInstance from './axiosInsatance';

export const login = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', {
    username,
    password
  });
  return response.data;
};
