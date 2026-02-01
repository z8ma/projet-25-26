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

  updateProfile: async (data: {
    companyName?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    description?: string;
    logoUrl?: string;
    phone?: string;
    city?: string;
    country?: string;
    typicalBudget?: string;
    preferredCreatives?: string[];
    linkedinUrl?: string;
    twitterUrl?: string;
  }) => {
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

  exploreProfessionals: async (params?: {
    profession?: string;
    availability?: string;
    minRating?: number;
    maxHourlyRate?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/api/professionals/explore', { params });
    return response.data;
  },

  getProfessionalById: async (id: string) => {
    const response = await api.get(`/api/professionals/details/${id}`);
    return response.data;
  },

  listAllProfessions: async () => {
    const response = await api.get('/api/professionals/professions/list');
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
    projectUrl?: string;
    projectType?: string;
    tags?: string[];
    isFeatured?: boolean;
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
    projectUrl?: string;
    projectType?: string;
    isFeatured?: boolean;
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

  getMyMatches: async () => {
    const response = await api.get('/api/professionals/matches');
    return response.data;
  },

  respondToMatch: async (matchId: string, status: 'ACCEPTED' | 'DECLINED') => {
    const response = await api.put(`/api/professionals/matches/${matchId}/respond`, { status });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/api/professionals/dashboard');
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

  addMessage: async (conversationId: string, data: { message: string; role: string; attachments?: any[] }) => {
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

  editLastMessage: async (conversationId: string, data: { newContent: string }) => {
    const response = await api.put(`/api/ai/conversations/${conversationId}/edit-message`, data);
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

  // Messaging
  getConversations: async () => {
    const response = await api.get('/api/matching/conversations');
    return response.data;
  },

  getMessages: async (matchId: string) => {
    const response = await api.get(`/api/matching/matches/${matchId}/messages`);
    return response.data;
  },

  sendMessage: async (matchId: string, data: { content: string }) => {
    const response = await api.post(`/api/matching/matches/${matchId}/messages`, data);
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

// Subscription API
export const subscriptionApi = {
  getCurrent: async () => {
    const response = await api.get('/api/subscriptions/current');
    return response.data;
  },

  getPlans: async () => {
    const response = await api.get('/api/subscriptions/plans');
    return response.data;
  },

  createCheckout: async (data: { planId: string; billingCycle: 'monthly' | 'yearly' }) => {
    const response = await api.post('/api/subscriptions/create-checkout', data);
    return response.data;
  },

  createPortal: async () => {
    const response = await api.post('/api/subscriptions/create-portal');
    return response.data;
  },

  cancel: async () => {
    const response = await api.post('/api/subscriptions/cancel');
    return response.data;
  },

  reactivate: async () => {
    const response = await api.post('/api/subscriptions/reactivate');
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

// Favorites API
export const favoritesApi = {
  getSavedProfessionals: async () => {
    const response = await api.get('/api/favorites');
    return response.data;
  },

  addToFavorites: async (professionalId: string, note?: string) => {
    const response = await api.post(`/api/favorites/${professionalId}`, { note });
    return response.data;
  },

  removeFromFavorites: async (professionalId: string) => {
    const response = await api.delete(`/api/favorites/${professionalId}`);
    return response.data;
  },

  updateNote: async (professionalId: string, note: string) => {
    const response = await api.put(`/api/favorites/${professionalId}`, { note });
    return response.data;
  },

  checkFavorite: async (professionalId: string) => {
    const response = await api.get(`/api/favorites/check/${professionalId}`);
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  uploadPortfolioImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/api/upload/portfolio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePortfolioImage: async (filename: string) => {
    const response = await api.delete(`/api/upload/portfolio/${filename}`);
    return response.data;
  },

  uploadBrainstormingFiles: async (files: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/api/upload/brainstorming/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },
};
