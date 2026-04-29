import { create } from 'zustand';
import api from '../api/axiosInstance';
import { connectSocket, disconnectSocket } from '../socket/socket';

const persistAuth = (token, user) => {
  if (token) {
    localStorage.setItem('token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  needsVerification: false,
  verificationEmail: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      if (data.requiresVerification) {
        set({ needsVerification: true, verificationEmail: data.email, loading: false });
        return;
      }
      // Fallback for legacy behavior if needed
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        bio: data.bio || '',
        profilePicture: data.profilePicture || '',
      };
      persistAuth(data.token, user);
      connectSocket(data.token);
      set({ user, token: data.token, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        bio: data.bio || '',
        profilePicture: data.profilePicture || '',
      };
      persistAuth(data.token, user);
      connectSocket(data.token);
      set({ user, token: data.token, loading: false });
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.requiresVerification) {
        set({ 
          needsVerification: true, 
          verificationEmail: errorData.email, 
          error: errorData.message,
          loading: false 
        });
        return;
      }
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
    }
  },

  verifyEmail: async (email, code) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/verify-email', { email, code });
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        bio: data.bio || '',
        profilePicture: data.profilePicture || '',
      };
      persistAuth(data.token, user);
      connectSocket(data.token);
      set({ 
        user,
        token: data.token, 
        needsVerification: false,
        verificationEmail: null,
        loading: false 
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Verification failed', loading: false });
      throw err;
    }
  },

  cancelVerification: () => set({ needsVerification: false, verificationEmail: null, error: null }),

  updateProfile: async ({ name, bio, profilePicture }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put('/users/me', { name, bio, profilePicture });
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        bio: data.bio || '',
        profilePicture: data.profilePicture || '',
      };
      persistAuth(localStorage.getItem('token'), user);
      set({ user, loading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      set({ error: message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
