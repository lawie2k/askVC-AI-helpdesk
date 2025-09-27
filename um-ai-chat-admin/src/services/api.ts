import API_BASE_URL from '../config/api';

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Department API functions
export const departmentAPI = {
  getAll: () => apiCall('/api/departments'),
  create: (data: any) => apiCall('/api/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/departments/${id}`, {
    method: 'DELETE',
  }),
};

// Room API functions
export const roomAPI = {
  getAll: () => apiCall('/api/rooms'),
  create: (data: any) => apiCall('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/rooms/${id}`, {
    method: 'DELETE',
  }),
};

// Office API functions
export const officeAPI = {
  getAll: () => apiCall('/api/offices'),
  create: (data: any) => apiCall('/api/offices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/offices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/offices/${id}`, {
    method: 'DELETE',
  }),
};

// Professor API functions
export const professorAPI = {
  getAll: () => apiCall('/api/professors'),
  create: (data: any) => apiCall('/api/professors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/professors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/professors/${id}`, {
    method: 'DELETE',
  }),
};

// Rules API functions
export const rulesAPI = {
  getAll: () => apiCall('/api/rules'),
  create: (data: any) => apiCall('/api/rules', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/rules/${id}`, {
    method: 'DELETE',
  }),
};

// Logs API functions
export const logsAPI = {
  getAll: () => apiCall('/api/logs'),
  create: (data: any) => apiCall('/api/logs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/logs/${id}`, {
    method: 'DELETE',
  }),
};

// Reports API functions
export const reportsAPI = {
  getAll: () => apiCall('/api/reports'),
  create: (data: any) => apiCall('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/reports/${id}`, {
    method: 'DELETE',
  }),
};

// Admin Authentication API functions
export const adminAuthAPI = {
  login: (username: string, password: string) => apiCall('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  register: (username: string, password: string) => apiCall('/auth/admin/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  logout: (username: string) => apiCall('/auth/admin/logout', {
    method: 'POST',
    body: JSON.stringify({ username }),
  }),
};
