import axiosInstance from './axiosInsatance';

// Create a new sale
export const createSale = (data) => axiosInstance.post('/sales', data);

// Get all sales (for admin)
export const getAllSales = () => axiosInstance.get('/sales/get-all');

// Get sales by cashier
export const getMySales = () => axiosInstance.get('/sales/my-sales');

// Get sale by ID
export const getSaleById = (id) => axiosInstance.get(`/sales/${id}`);

// Get receipt
export const getReceipt = (id) => axiosInstance.get(`/sales/${id}/receipt`);
