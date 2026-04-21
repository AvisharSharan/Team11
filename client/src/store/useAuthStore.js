import { create } from 'zustand';
import api from '../api/axiosInstance';
import { connectSocket, disconnectSocket } from '../socket/socket';

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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      connectSocket(data.token);
      set({ user: { _id: data._id, name: data.name, email: data.email }, token: data.token, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      connectSocket(data.token);
      set({ user: { _id: data._id, name: data.name, email: data.email }, token: data.token, loading: false });
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      connectSocket(data.token);
      set({ 
        user: { _id: data._id, name: data.name, email: data.email }, 
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

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
