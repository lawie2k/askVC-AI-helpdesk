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

// Building API functions
export const buildingAPI = {
  getAll: () => apiCall('/api/buildings'),
  create: (data: any) => apiCall('/api/buildings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/buildings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/buildings/${id}`, {
    method: 'DELETE',
  }),
};

// Room API functions (without availability)
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

export const visionMissionAPI = {
  getAll: () => apiCall('/api/vision-mission'),
  create: (data: any) => apiCall('/api/vision-mission', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/vision-mission/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/vision-mission/${id}`, {
    method: 'DELETE',
  }),
};

export const campusInfoAPI = {
  getAll: () => apiCall('/api/campus-info'),
  create: (data: any) => apiCall('/api/campus-info', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/campus-info/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/campus-info/${id}`, {
    method: 'DELETE',
  }),
};

export const announcementsAPI = {
  getAll: () => apiCall('/api/announcements'),
  create: (data: any) => apiCall('/api/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/announcements/${id}`, {
    method: 'DELETE',
  }),
};

export const nonTeachingAPI = {
  getAll: () => apiCall('/api/non-teaching-staff'),
  create: (data: any) => apiCall('/api/non-teaching-staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiCall(`/api/non-teaching-staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiCall(`/api/non-teaching-staff/${id}`, {
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

// Stats API (for dashboard charts)
export const statsAPI = {
  getTopQuestions: () => apiCall('/api/stats/top-questions'),
};

// Feedback API functions
export const feedbackAPI = {
  getAll: () => apiCall('/api/feedback'),
};
// Upload API functions
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const token = localStorage.getItem('adminToken');
    console.log('🔑 Token exists:', !!token);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/upload/image`);
    
    const formData = new FormData();
    formData.append('image', file);
    console.log('📦 FormData created with file:', file.name, file.size, 'bytes');

    try {
      console.log('🚀 Sending upload request...');
      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
      });

      console.log('📥 Response status:', response.status, response.statusText);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      // Read response as text first (can only read once)
      const responseText = await response.text();
      console.log('📥 Response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          // Not JSON, use text as error message
          errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ Upload error response:', errorData);
        const errorMessage = errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Response is OK, parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Upload response:', result);
      } catch (e) {
        console.error('❌ Failed to parse response as JSON:', e, 'Response text:', responseText);
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`);
      }
      return result;
    } catch (error: any) {
      console.error('❌ Upload request failed:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Could not reach server. Check your connection.');
      }
      // Re-throw with a more descriptive message if it's just "Unknown error"
      if (error.message === 'Unknown error' || !error.message) {
        throw new Error('Upload failed: Server returned an error. Check backend logs for details.');
      }
      throw error;
    }
  },
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
