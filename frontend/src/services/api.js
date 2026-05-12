import axios from 'axios';
import { auth } from '../firebase';

// Danish bhai, humne yahan direct backend ka link daal diya hai
const API_URL = 'https://prime-1iwuzbyoe-danish122.vercel.app/api';
const api = axios.create({ 
  baseURL: API_URL 
});

api.interceptors.request.use(async cfg => {
  if (auth.currentUser) {
    const t = await auth.currentUser.getIdToken();
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});

// SuperAdmin
export const SA = {
  getFeeConfig:       ()      => api.get('/superadmin/fee-config'),
  saveFeeConfig:      (d)     => api.post('/superadmin/fee-config', d),
  getRestaurants:     ()      => api.get('/superadmin/restaurants'),
  createRestaurant:   (d)     => api.post('/superadmin/restaurants', d),
  updateRestaurant:   (id,d)  => api.patch(`/superadmin/restaurants/${id}`, d),
  suspendRestaurant:  (id)    => api.delete(`/superadmin/restaurants/${id}`),
  getRevenue:         ()      => api.get('/superadmin/revenue'),
  getUsers:           ()      => api.get('/superadmin/users'),
};

// Restaurant (Admin + Client)
export const REST = {
  getMenu:         ()      => api.get('/restaurant/menu'),
  getAllMenu:      ()      => api.get('/restaurant/menu/all'),
  addMenuItem:     (d)     => api.post('/restaurant/menu', d),
  updateMenuItem: (id,d)   => api.patch(`/restaurant/menu/${id}`, d),
  deleteMenuItem: (id)     => api.delete(`/restaurant/menu/${id}`),
  getTables:       ()      => api.get('/restaurant/tables'),
  addTable:        (d)     => api.post('/restaurant/tables', d),
  updateTable:     (id,d)  => api.patch(`/restaurant/tables/${id}`, d),
  placeOrder:      (d)     => api.post('/restaurant/orders', d),
  getOrders:       (p)     => api.get('/restaurant/orders', { params: p }),
  getTodayOrders: ()       => api.get('/restaurant/orders/today'),
  updateOrderStatus:(id,s) => api.patch(`/restaurant/orders/${id}/status`, { status: s }),
  getStaff:        ()      => api.get('/restaurant/staff'),
  addStaff:        (d)     => api.post('/restaurant/staff', d),
  getStats:        ()      => api.get('/restaurant/stats'),
};

// Finance
export const FIN = {
  getPayments:     ()    => api.get('/payments'),
  createPayment:   (d)   => api.post('/payments', d),
  updatePayment:   (id,d)=> api.patch(`/payments/${id}`, d),
  getInvoices:     ()    => api.get('/invoices'),
  createInvoice:   (d)   => api.post('/invoices', d),
  updateInvoice:   (id,d)=> api.patch(`/invoices/${id}`, d),
  getCredit:       ()    => api.get('/credit'),
  applyCredit:     (d)   => api.post('/credit/apply', d),
  drawCredit:      (amt) => api.post('/credit/draw', { amount: amt }),
  repayCredit:     (amt) => api.post('/credit/repay', { amount: amt }),
  getCreditTxns:   ()    => api.get('/credit/transactions'),
  getPayroll:      ()    => api.get('/payroll'),
  createPayroll:   (d)   => api.post('/payroll', d),
  getInventory:    ()    => api.get('/inventory'),
  addInventory:    (d)   => api.post('/inventory', d),
  updateInventory:(id,d) => api.patch(`/inventory/${id}`, d),
  deleteInventory:(id)   => api.delete(`/inventory/${id}`),
  getEmployees:    ()    => api.get('/employees'),
  addEmployee:     (d)   => api.post('/employees', d),
  updateEmployee: (id,d) => api.patch(`/employees/${id}`, d),
};

export default api;
