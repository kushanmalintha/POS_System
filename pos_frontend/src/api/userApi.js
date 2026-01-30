import axiosInstance from './axiosInsatance';

// Get all users (Admin)
export const getAllUsers = () => {
  return axiosInstance.get('/users');
};

// Create cashier user (Admin)
export const createUser = (data) => {
  /*
    data format:
    {
      username: string,
      password: string,
      role: "CASHIER"
    }
  */
  return axiosInstance.post('/users', data);
};
