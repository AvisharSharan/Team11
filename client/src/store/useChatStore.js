import { create } from 'zustand';
import api from '../api/axiosInstance';

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  messagesByConversation: {},
  unreadCounts: {}, // conversationId -> count
  isTyping: {},     // conversationId -> boolean
  onlineUsers: {},
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
    const conversationId = conversation?._id ? String(conversation._id) : null;

    set((state) => ({
      activeConversation: conversation,
      messages: conversationId ? (state.messagesByConversation[conversationId] || []) : [],
      loadingMessages: conversationId ? !state.messagesByConversation[conversationId] : false,
      // Clear unread count when opening the conversation
      unreadCounts: conversation
        ? { ...state.unreadCounts, [conversation._id]: 0 }
        : state.unreadCounts,
    }));
  },

  // ─── Messages ─────────────────────────────────────────────────────────────
  fetchMessages: async (conversationId) => {
    const normalizedConversationId = String(conversationId);
    const cachedMessages = get().messagesByConversation[normalizedConversationId];

    set((state) => ({
      messages: cachedMessages || state.messages,
      loadingMessages: !cachedMessages,
    }));

    try {
      const { data } = await api.get(`/messages/${conversationId}`);
      set((state) => {
        const isActiveConversation = String(state.activeConversation?._id || '') === normalizedConversationId;

        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [normalizedConversationId]: data,
          },
          messages: isActiveConversation ? data : state.messages,
          loadingMessages: isActiveConversation ? false : state.loadingMessages,
        };
      });
    } catch (err) {
      console.error('fetchMessages error:', err);
      set((state) => ({
        loadingMessages:
          String(state.activeConversation?._id || '') === normalizedConversationId
            ? false
            : state.loadingMessages,
      }));
    }
  },

  sendMessage: async (conversationId, content, sender) => {
    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const pendingMessage = {
      _id: tempId,
      conversationId,
      sender,
      content,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    set((state) => {
      const normalizedConversationId = String(conversationId);
      const currentMessages = state.messagesByConversation[normalizedConversationId] || state.messages;
      const updatedMessages = [...currentMessages, pendingMessage];

      return {
        messages: String(state.activeConversation?._id || '') === normalizedConversationId
          ? updatedMessages
          : state.messages,
        messagesByConversation: {
          ...state.messagesByConversation,
          [normalizedConversationId]: updatedMessages,
        },
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, lastMessage: pendingMessage, updatedAt: pendingMessage.createdAt } : c
        ),
      };
    });

    try {
      const { data } = await api.post('/messages', { conversationId, content });
      set((state) => {
        const normalizedConversationId = String(conversationId);
        const cachedMessages = state.messagesByConversation[normalizedConversationId] || [];
        const updatedCachedMessages = cachedMessages.map((message) => (message._id === tempId ? data : message));

        return {
          messages: String(state.activeConversation?._id || '') === normalizedConversationId
            ? updatedCachedMessages
            : state.messages,
          messagesByConversation: {
            ...state.messagesByConversation,
            [normalizedConversationId]: updatedCachedMessages,
          },
          conversations: state.conversations.map((c) =>
            c._id === conversationId ? { ...c, lastMessage: data, updatedAt: data.createdAt } : c
          ),
        };
      });
      return data;
    } catch (err) {
      console.error('sendMessage error:', err);
      set((state) => {
        const normalizedConversationId = String(conversationId);
        const cachedMessages = state.messagesByConversation[normalizedConversationId] || [];
        const updatedCachedMessages = cachedMessages.map((message) =>
          message._id === tempId ? { ...message, pending: false, failed: true } : message
        );

        return {
          messages: String(state.activeConversation?._id || '') === normalizedConversationId
            ? updatedCachedMessages
            : state.messages,
          messagesByConversation: {
            ...state.messagesByConversation,
            [normalizedConversationId]: updatedCachedMessages,
          },
          conversations: state.conversations.map((c) =>
            c._id === conversationId && c.lastMessage?._id === tempId
              ? { ...c, lastMessage: { ...pendingMessage, pending: false, failed: true } }
              : c
          ),
        };
      });
      throw err;
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

      set((state) => {
        const normalizedConversationId = String(conversationId);
        const currentMessages = state.messagesByConversation[normalizedConversationId] || state.messages;
        const updatedMessages = [...currentMessages, messageData];

        return {
          messages: String(state.activeConversation?._id || '') === normalizedConversationId
            ? updatedMessages
            : state.messages,
          messagesByConversation: {
            ...state.messagesByConversation,
            [normalizedConversationId]: updatedMessages,
          },
          conversations: state.conversations.map((c) =>
            c._id === conversationId ? { ...c, lastMessage: messageData, updatedAt: messageData.createdAt } : c
          ),
        };
      });

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
      set((state) => {
        const cachedMessages = state.messagesByConversation[conversationId] || state.messages;
        const updatedMessages = [...cachedMessages, message];

        return {
          messages: updatedMessages,
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: updatedMessages,
          },
        };
      });
    } else {
      // Increment unread badge for the other conversation
      set((state) => ({
        messagesByConversation: state.messagesByConversation[conversationId]
          ? {
              ...state.messagesByConversation,
              [conversationId]: [...state.messagesByConversation[conversationId], message],
            }
          : state.messagesByConversation,
        unreadCounts: {
          ...unreadCounts,
          [conversationId]: (unreadCounts[conversationId] || 0) + 1,
        },
      }));
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

  setOnlineUsers: (userIds) =>
    set({
      onlineUsers: userIds.reduce((acc, userId) => {
        acc[String(userId)] = true;
        return acc;
      }, {}),
    }),

  setUserPresence: (userId, isOnline) =>
    set((state) => {
      const onlineUsers = { ...state.onlineUsers };
      if (isOnline) {
        onlineUsers[String(userId)] = true;
      } else {
        delete onlineUsers[String(userId)];
      }
      return { onlineUsers };
    }),

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
          messagesByConversation: Object.fromEntries(
            Object.entries(state.messagesByConversation).filter(([id]) => id !== String(conversationId))
          ),
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
        messagesByConversation: Object.fromEntries(
          Object.entries(state.messagesByConversation).filter(([id]) => id !== String(conversationId))
        ),
      };
    });
  },
}));

export default useChatStore;
