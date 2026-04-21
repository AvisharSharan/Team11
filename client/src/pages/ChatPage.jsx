import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import { connectSocket, getSocket } from '../socket/socket';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const { user, token, logout } = useAuthStore();
  const { conversations, fetchConversations, receiveMessage, setTyping, removeConversation } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Connect socket and setup user room
    connectSocket(token);
    fetchConversations();

    const socket = getSocket();

    // Incoming message from another user
    const onMessageReceived = (message) => {
      receiveMessage(message);
    };

    // Typing events
    const onTyping = ({ conversationId, senderName }) => {
      setTyping(conversationId, senderName);
    };

    const onStopTyping = ({ conversationId }) => {
      setTyping(conversationId, null);
    };

    const onConversationDeleted = ({ conversationId }) => {
      removeConversation(conversationId);
    };

    socket.on('message received', onMessageReceived);
    socket.on('typing', onTyping);
    socket.on('stop typing', onStopTyping);
    socket.on('conversation deleted', onConversationDeleted);

    return () => {
      socket.off('message received', onMessageReceived);
      socket.off('typing', onTyping);
      socket.off('stop typing', onStopTyping);
      socket.off('conversation deleted', onConversationDeleted);
    };
  }, [user, navigate, fetchConversations, receiveMessage, setTyping]);

  // Join all conversation rooms to receive real-time updates for unread messages
  useEffect(() => {
    if (conversations.length === 0) return;

    const socket = getSocket();
    conversations.forEach((conv) => {
      socket.emit('join conversation', conv._id);
    });

    return () => {
      conversations.forEach((conv) => {
        socket.emit('leave conversation', conv._id);
      });
    };
  }, [conversations]);

  if (!user) return null;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const avatarTone = (name = '') => `tone-${name.charCodeAt(0) % 8}`;
  const openAddMemberPage = () => navigate('/add-member');

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-top-header">
        <div className="chat-header-left">
          <button
            className="chat-menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="chat-app-title">SyncSphere</h1>
        </div>
        <div className="chat-header-right">
          <button
            className="chat-add-member-btn"
            onClick={openAddMemberPage}
            type="button"
          >
            Add member
          </button>
          <div className="chat-user-mini">
            <div className={`chat-user-avatar-sm ${avatarTone(user?.name || '')}`}>
              {user?.name?.[0].toUpperCase()}{user?.name?.split(' ')[1]?.[0]?.toUpperCase() || ''}
            </div>
            <span className="chat-user-name-sm">{user?.name}</span>
          </div>
          <button className="chat-logout-btn" onClick={logout} title="Logout" aria-label="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="chat-main">
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar} />
        )}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <ChatWindow onToggleSidebar={toggleSidebar} />
      </div>
    </div>
  );
};

export default ChatPage;
