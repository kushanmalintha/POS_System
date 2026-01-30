import axiosInstance from './axiosInsatance';

export const getProducts = () => {
  return axiosInstance.get('/products');
};

export const createProduct = (data) => {
  return axiosInstance.post('/products', data);
};

export const updateProduct = (id, data) => {
  return axiosInstance.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return axiosInstance.delete(`/products/${id}`);
};
