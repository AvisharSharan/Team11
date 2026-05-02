import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import { connectSocket, getSocket } from '../socket/socket';
import { requestNotificationPermission, showMessageNotification } from '../utils/browserNotifications';
import UserAvatar from '../components/UserAvatar';
import ProfilePanel from '../components/ProfilePanel';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const { user, token, logout } = useAuthStore();
  const { conversations, fetchConversations, receiveMessage, setTyping, removeConversation, setActiveConversation } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePanelState, setProfilePanelState] = useState({ open: false, mode: 'view', user: null });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('chat-theme') === 'dark');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const searchTimeoutRef = useRef(null);
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
    requestNotificationPermission();

    const socket = getSocket();

    // Incoming message from another user
    const onMessageReceived = (message) => {
      showMessageNotification(message);
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
  }, [user, token, navigate, fetchConversations, receiveMessage, setTyping, removeConversation]);

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

  useEffect(() => {
    localStorage.setItem('chat-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);

    if (!searchText.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get(`/messages/search?query=${encodeURIComponent(searchText.trim())}`);
        setSearchResults(data);
      } catch (error) {
        console.error('Conversation search failed:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchText]);

  if (!user) return null;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const openTeamManagement = () => navigate('/team-management');
  const openOwnProfile = () => setProfilePanelState({ open: true, mode: 'edit', user });
  const openUserProfile = (targetUser) => {
    if (!targetUser) return;
    const mode = targetUser._id === user._id ? 'edit' : 'view';
    setProfilePanelState({ open: true, mode, user: targetUser });
  };
  const closeProfilePanel = () => setProfilePanelState({ open: false, mode: 'view', user: null });
  const handleProfileSaved = async () => {
    setProfilePanelState({ open: false, mode: 'view', user: null });
    await fetchConversations();
  };
  const getConversationResultTitle = (conversation) => {
    if (conversation.isGroup) {
      return conversation.groupName || 'Group chat';
    }

    const otherUser = conversation.participants?.find((participant) => participant._id !== user._id);
    return otherUser?.name || 'Chat';
  };
  const openSearchResult = (result) => {
    if (!result?.conversation) return;

    setActiveConversation(result.conversation);
    setHighlightedMessageId(result._id);
    setSearchText('');
    setSearchResults([]);
    closeSidebar();
  };
  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      setSearchText('');
      setSearchResults([]);
    }
  };
  const toggleDarkMode = () => setIsDarkMode((current) => !current);

  return (
    <div className={`chat-page${isDarkMode ? ' theme-dark' : ''}`}>
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
          <div className="chat-global-search">
            <svg className="chat-global-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="chat-global-search-input"
              placeholder="Search messages"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {(searchLoading || searchText.trim()) && (
              <div className="chat-search-results">
                {searchLoading ? (
                  <p className="chat-search-status">Searching messages...</p>
                ) : searchResults.length === 0 ? (
                  <p className="chat-search-status">No matching messages</p>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={result._id}
                      type="button"
                      className="chat-search-result"
                      onClick={() => openSearchResult(result)}
                    >
                      <div className="chat-search-result-top">
                        <span className="chat-search-result-title">{getConversationResultTitle(result.conversation)}</span>
                        <span className="chat-search-result-time">
                          {new Date(result.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="chat-search-result-meta">{result.sender?.name || 'User'}</p>
                      <p className="chat-search-result-snippet">{result.content}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="chat-header-right">
          <div className="chat-member-actions">
            <button
              className="chat-theme-toggle"
              onClick={toggleDarkMode}
              type="button"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 1 0 9 9 9 9 0 1 1-9-9z" />
                </svg>
              )}
            </button>
            <button
              className="chat-team-management-btn"
              onClick={openTeamManagement}
              type="button"
            >
              <span className="chat-team-label-full">Team Management</span>
              <span className="chat-team-label-short">Team</span>
            </button>
          </div>
          <button className="chat-user-mini" type="button" onClick={openOwnProfile}>
            <UserAvatar user={user} className="chat-user-avatar-sm" />
            <span className="chat-user-name-sm">{user?.name}</span>
          </button>
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
        <ChatWindow
          onViewProfile={openUserProfile}
          highlightedMessageId={highlightedMessageId}
          onHighlightHandled={() => setHighlightedMessageId(null)}
        />
      </div>
      {profilePanelState.open && (
        <ProfilePanel
          mode={profilePanelState.mode}
          user={profilePanelState.user}
          onClose={closeProfilePanel}
          onProfileSaved={handleProfileSaved}
        />
      )}
    </div>
  );
};

export default ChatPage;
