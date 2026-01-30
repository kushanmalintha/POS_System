import axiosInstance from './axiosInsatance';

export const getCategories = () => {
  return axiosInstance.get('/categories');
};

export const createCategory = (data) => {
  return axiosInstance.post('/categories', data);
};

export const updateCategory = (id, data) => {
  return axiosInstance.put(`/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return axiosInstance.delete(`/categories/${id}`);
};
