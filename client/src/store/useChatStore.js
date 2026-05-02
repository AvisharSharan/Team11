import { create } from 'zustand';
import api from '../api/axiosInstance';

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCounts: {}, // conversationId -> count
  isTyping: {},     // conversationId -> boolean
  loadingMessages: false,

  // ─── Conversations ────────────────────────────────────────────────────────
  fetchConversations: async () => {
    try {
      const { data } = await api.get('/conversations');
      set({ conversations: data });
    } catch (err) {
      console.error('fetchConversations error:', err);
    }
  },

  startOrOpenConversation: async (recipientId) => {
    try {
      const { data } = await api.post('/conversations', { recipientId });
      const { conversations } = get();
      const exists = conversations.find((c) => c._id === data._id);
      if (!exists) {
        set({ conversations: [data, ...conversations] });
      }
      get().setActiveConversation(data);
      return data;
    } catch (err) {
      console.error('startOrOpenConversation error:', err);
    }
  },

  createGroupConversation: async (name, participantIds) => {
    try {
      const { data } = await api.post('/conversations/group', { name, participantIds });
      set((state) => ({ conversations: [data, ...state.conversations] }));
      get().setActiveConversation(data);
      return data;
    } catch (err) {
      console.error('createGroupConversation error:', err);
      throw err;
    }
  },

  setActiveConversation: (conversation) => {
    set((state) => ({
      activeConversation: conversation,
      // Clear unread count when opening the conversation
      unreadCounts: conversation
        ? { ...state.unreadCounts, [conversation._id]: 0 }
        : state.unreadCounts,
    }));
  },

  // ─── Messages ─────────────────────────────────────────────────────────────
  fetchMessages: async (conversationId) => {
    set({ loadingMessages: true });
    try {
      const { data } = await api.get(`/messages/${conversationId}`);
      set({ messages: data, loadingMessages: false });
    } catch (err) {
      console.error('fetchMessages error:', err);
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const { data } = await api.post('/messages', { conversationId, content });
      // Optimistically add to local messages list
      set((state) => ({ messages: [...state.messages, data] }));
      // Update lastMessage on the conversation in sidebar
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, lastMessage: data, updatedAt: data.createdAt } : c
        ),
      }));
      return data;
    } catch (err) {
      console.error('sendMessage error:', err);
    }
  },

  sendFile: async (conversationId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1. Upload file to Cloudinary via our backend
      const { data: uploadData } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. Send message with file metadata
      const { data: messageData } = await api.post('/messages', {
        conversationId,
        fileUrl: uploadData.fileUrl,
        filePublicId: uploadData.filePublicId,
        fileType: uploadData.fileType,
        fileName: uploadData.originalName,
      });

      // Optimistically add to local messages list
      set((state) => ({ messages: [...state.messages, messageData] }));
      
      // Update lastMessage on the conversation in sidebar
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, lastMessage: messageData, updatedAt: messageData.createdAt } : c
        ),
      }));

      return messageData;
    } catch (err) {
      console.error('sendFile error:', err);
      throw err;
    }
  },

  // Called by socket listener when a new message arrives from another user
  receiveMessage: (message) => {
    const conversationId = String(message.conversationId || message.conversation?._id || '');
    const { activeConversation, unreadCounts } = get();

    if (!conversationId) return;

    // If the message belongs to the currently open conversation, append it
    if (activeConversation && String(activeConversation._id) === conversationId) {
      set((state) => ({ messages: [...state.messages, message] }));
    } else {
      // Increment unread badge for the other conversation
      set({
        unreadCounts: {
          ...unreadCounts,
          [conversationId]: (unreadCounts[conversationId] || 0) + 1,
        },
      });
    }

    set((state) => ({
      conversations: (() => {
        const existingConversation = state.conversations.find((c) => String(c._id) === conversationId);
        const updatedConversation = existingConversation
          ? { ...existingConversation, lastMessage: message, updatedAt: message.createdAt }
          : message.conversation
            ? { ...message.conversation, lastMessage: message, updatedAt: message.createdAt }
            : null;

        if (!updatedConversation) return state.conversations;

        return [
          updatedConversation,
          ...state.conversations.filter((c) => String(c._id) !== conversationId),
        ];
      })(),
    }));
  },

  // ─── Typing ───────────────────────────────────────────────────────────────
  setTyping: (conversationId, value) =>
    set((state) => ({
      isTyping: { ...state.isTyping, [conversationId]: value },
    })),

  deleteConversation: async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      
      set((state) => {
        const newConversations = state.conversations.filter((c) => c._id !== conversationId);
        const isActive = state.activeConversation?._id === conversationId;
        
        return {
          conversations: newConversations,
          activeConversation: isActive ? null : state.activeConversation,
          messages: isActive ? [] : state.messages,
        };
      });
      return true;
    } catch (err) {
      console.error('deleteConversation error:', err);
      throw err;
    }
  },

  // Locally remove from state (used by socket listener)
  removeConversation: (conversationId) => {
    set((state) => {
      const newConversations = state.conversations.filter((c) => c._id !== conversationId);
      const isActive = state.activeConversation?._id === conversationId;
      return {
        conversations: newConversations,
        activeConversation: isActive ? null : state.activeConversation,
        messages: isActive ? [] : state.messages,
      };
    });
  },
}));

export default useChatStore;
