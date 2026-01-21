import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    role: 'CREATOR' | 'PROFESSIONAL';
    companyName?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Creator API
export const creatorApi = {
  getProfile: async () => {
    const response = await api.get('/api/creators/profile');
    return response.data;
  },

  updateProfile: async (data: { companyName?: string }) => {
    const response = await api.put('/api/creators/profile', data);
    return response.data;
  },
};

// Professional API
export const professionalApi = {
  getProfile: async () => {
    const response = await api.get('/api/professionals/profile');
    return response.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    experienceYears?: number;
    hourlyRate?: number;
    availability?: string;
    bio?: string;
    otherProfession?: string;
    // Nouveaux champs IA Matching
    missionTypes?: string[];
    otherMissionType?: string;
    preferredClientTypes?: string[];
    preferredCollabTypes?: string[];
    minimumBudget?: number;
    exclusions?: string[];
  }) => {
    const response = await api.put('/api/professionals/profile', data);
    return response.data;
  },

  getProfessions: async () => {
    const response = await api.get('/api/professionals/professions');
    return response.data;
  },

  addProfession: async (data: { professionId: string; isPrimary?: boolean }) => {
    const response = await api.post('/api/professionals/professions', data);
    return response.data;
  },

  removeProfession: async (id: string) => {
    const response = await api.delete(`/api/professionals/professions/${id}`);
    return response.data;
  },

  addSkill: async (data: { softwareName: string; proficiencyLevel?: string; yearsOfUse?: number }) => {
    const response = await api.post('/api/professionals/skills', data);
    return response.data;
  },

  updateSkill: async (id: string, data: { softwareName?: string; proficiencyLevel?: string; yearsOfUse?: number }) => {
    const response = await api.put(`/api/professionals/skills/${id}`, data);
    return response.data;
  },

  removeSkill: async (id: string) => {
    const response = await api.delete(`/api/professionals/skills/${id}`);
    return response.data;
  },

  addPortfolio: async (data: {
    title: string;
    description?: string;
    imageUrl?: string;
    projectType?: string;
    tags?: string[];
    // Nouveaux champs enrichissement IA
    clientType?: string;
    projectGoal?: string;
    roleDescription?: string;
    projectDuration?: string;
    projectImpact?: string;
    projectYear?: number;
  }) => {
    const response = await api.post('/api/professionals/portfolio', data);
    return response.data;
  },

  updatePortfolio: async (id: string, data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    projectType?: string;
    clientType?: string;
    projectGoal?: string;
    roleDescription?: string;
    projectDuration?: string;
    projectImpact?: string;
    projectYear?: number;
  }) => {
    const response = await api.put(`/api/professionals/portfolio/${id}`, data);
    return response.data;
  },

  removePortfolio: async (id: string) => {
    const response = await api.delete(`/api/professionals/portfolio/${id}`);
    return response.data;
  },

  getMessages: async () => {
    const response = await api.get('/api/professionals/messages');
    return response.data;
  },

  markMessageAsRead: async (id: string) => {
    const response = await api.put(`/api/professionals/messages/${id}/read`);
    return response.data;
  },
};

// AI API
export const aiApi = {
  getConversations: async () => {
    const response = await api.get('/api/ai/conversations');
    return response.data;
  },

  getConversation: async (id: string) => {
    const response = await api.get(`/api/ai/conversations/${id}`);
    return response.data;
  },

  createConversation: async (data: { projectTitle?: string }) => {
    const response = await api.post('/api/ai/conversations', data);
    return response.data;
  },

  addMessage: async (conversationId: string, data: { message: string; role: string }) => {
    const response = await api.post(`/api/ai/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  completeConversation: async (conversationId: string, data: { projectSummary?: string }) => {
    const response = await api.put(`/api/ai/conversations/${conversationId}/complete`, data);
    return response.data;
  },

  deleteConversation: async (conversationId: string) => {
    const response = await api.delete(`/api/ai/conversations/${conversationId}`);
    return response.data;
  },

  updateConversationTitle: async (conversationId: string, data: { projectTitle: string }) => {
    const response = await api.put(`/api/ai/conversations/${conversationId}/title`, data);
    return response.data;
  },
};

// Matching API
export const matchingApi = {
  generateMatches: async (conversationId: string) => {
    const response = await api.post(`/api/matching/conversations/${conversationId}/match`);
    return response.data;
  },

  getMatches: async (conversationId: string) => {
    const response = await api.get(`/api/matching/conversations/${conversationId}/matches`);
    return response.data;
  },

  contactProfessional: async (matchId: string, data: { message: string }) => {
    const response = await api.put(`/api/matching/matches/${matchId}/contact`, data);
    return response.data;
  },

  updateProjectStatus: async (matchId: string, data: { projectStatus: string }) => {
    const response = await api.put(`/api/matching/matches/${matchId}/project-status`, data);
    return response.data;
  },
};

// Notification API
export const notificationApi = {
  getNotifications: async () => {
    const response = await api.get('/api/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },
};

// Rating API
export const ratingApi = {
  createRating: async (data: { matchId: string; rating: number; comment?: string }) => {
    const response = await api.post('/api/ratings', data);
    return response.data;
  },

  getRating: async (matchId: string) => {
    const response = await api.get(`/api/ratings/match/${matchId}`);
    return response.data;
  },
};
