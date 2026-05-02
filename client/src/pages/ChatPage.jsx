import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import { connectSocket, getSocket } from '../socket/socket';
import { requestNotificationPermission, showMessageNotification } from '../utils/browserNotifications';
import ProfilePanel from '../components/ProfilePanel';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const { user, token, logout } = useAuthStore();
  const {
    conversations,
    fetchConversations,
    receiveMessage,
    setTyping,
    removeConversation,
    setActiveConversation,
    setOnlineUsers,
    setUserPresence,
  } = useChatStore();
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

    const onPresenceSnapshot = (userIds) => {
      setOnlineUsers(userIds);
    };

    const onPresenceChanged = ({ userId, isOnline }) => {
      setUserPresence(userId, isOnline);
    };

    socket.on('message received', onMessageReceived);
    socket.on('typing', onTyping);
    socket.on('stop typing', onStopTyping);
    socket.on('conversation deleted', onConversationDeleted);
    socket.on('presence snapshot', onPresenceSnapshot);
    socket.on('user presence changed', onPresenceChanged);

    return () => {
      socket.off('message received', onMessageReceived);
      socket.off('typing', onTyping);
      socket.off('stop typing', onStopTyping);
      socket.off('conversation deleted', onConversationDeleted);
      socket.off('presence snapshot', onPresenceSnapshot);
      socket.off('user presence changed', onPresenceChanged);
    };
  }, [
    user,
    token,
    navigate,
    fetchConversations,
    receiveMessage,
    setTyping,
    removeConversation,
    setOnlineUsers,
    setUserPresence,
  ]);

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
      </header>

      {/* Main content */}
      <div className="chat-main">
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar} />
        )}
        <Sidebar
          isOpen={sidebarOpen}
          isDarkMode={isDarkMode}
          onClose={closeSidebar}
          onOpenProfile={openOwnProfile}
          onToggleDarkMode={toggleDarkMode}
          onOpenTeamManagement={openTeamManagement}
          onLogout={logout}
        />
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
