import React, { useRef, useState } from 'react';
import api from '../api/axiosInstance';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { getSocket } from '../socket/socket';
import UserAvatar from './UserAvatar';
import '../styles/components/Sidebar.css';

const Sidebar = ({
  isOpen = false,
  isDarkMode = false,
  onClose = () => {},
  onOpenProfile = () => {},
  onToggleDarkMode = () => {},
  onOpenTeamManagement = () => {},
  onLogout = () => {},
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [groupError, setGroupError] = useState('');
  const debounceRef = useRef(null);
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    unreadCounts,
    isTyping,
    onlineUsers,
    startOrOpenConversation,
    createGroupConversation,
    deleteConversation,
  } = useChatStore();
  const { user, token } = useAuthStore();

  const getOtherParticipant = (conversation) =>
    conversation.participants.find((p) => p._id !== user._id);

  const handleSelectConversation = (conversation) => {
    if (isDeleteMode) {
      toggleSelectToDelete(conversation._id);
      return;
    }
    setActiveConversation(conversation);
    onClose();
  };

  const toggleSelectToDelete = (id) => {
    setSelectedToDelete((prev) =>
      prev.includes(id) ? prev.filter((curr) => curr !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (selectedToDelete.length === 0) return;
    
    const confirmMsg = `Delete ${selectedToDelete.length} conversation(s)? This will remove all messages for you.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const socket = getSocket(token);
      for (const id of selectedToDelete) {
        const conv = conversations.find(c => c._id === id);
        if (conv) {
          socket.emit('delete conversation', {
            conversationId: id,
            participants: conv.participants.map(p => p._id || p)
          });
        }
        await deleteConversation(id);
      }
      setIsDeleteMode(false);
      setSelectedToDelete([]);
    } catch (err) {
      alert('Some conversations could not be deleted. Note: Only admins can delete groups.');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/users/search?query=${encodeURIComponent(value.trim())}`);
        setSearchResults(data);
      } catch (err) {
        console.error('Inline search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelectUser = async (userId) => {
    if (isCreatingGroup) {
      setSelectedGroupUsers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
      return;
    }

    await startOrOpenConversation(userId);
    setQuery('');
    setSearchResults([]);
    onClose();
  };

  const startGroupCreation = () => {
    setIsCreatingGroup(true);
    setGroupError('');
    setQuery('');
    setSearchResults([]);
  };

  const cancelGroupCreation = () => {
    setIsCreatingGroup(false);
    setGroupName('');
    setSelectedGroupUsers([]);
    setGroupError('');
    setQuery('');
    setSearchResults([]);
  };

  const submitCreateGroup = async () => {
    if (!groupName.trim()) {
      setGroupError('Group name is required');
      return;
    }
    if (selectedGroupUsers.length < 2) {
      setGroupError('Select at least 2 people');
      return;
    }

    try {
      await createGroupConversation(groupName.trim(), selectedGroupUsers);
      cancelGroupCreation();
      onClose();
    } catch (err) {
      setGroupError(err?.response?.data?.message || 'Failed to create group');
    }
  };

  const isInlineSearching = Boolean(query.trim());

  const handleOpenProfile = () => {
    onOpenProfile();
    onClose();
  };

  const handleOpenTeamManagement = () => {
    onOpenTeamManagement();
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const getConversationTitle = (conversation) => {
    if (conversation.isGroup) {
      return conversation.groupName || 'Group chat';
    }
    return getOtherParticipant(conversation)?.name || 'Chat';
  };

  const getConversationSubtitle = (conversation, isOtherTyping) => {
    if (isOtherTyping) return 'typing...';

    if (conversation.lastMessage) {
      if (conversation.isGroup && conversation.lastMessage.sender?.name) {
        const preview = conversation.lastMessage.content || '';
        return `${conversation.lastMessage.sender.name}: ${preview.substring(0, 24)}${preview.length > 24 ? '…' : ''}`;
      }
      return conversation.lastMessage.content?.substring(0, 32) +
        (conversation.lastMessage.content?.length > 32 ? '…' : '');
    }

    if (conversation.isGroup) {
      const memberCount = conversation.participants?.length || 0;
      return `${memberCount} members`;
    }

    return 'No messages yet';
  };

  const isUserOnline = (userId) => Boolean(onlineUsers[String(userId)]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      {/* Search */}
      <div className="sidebar-search-wrap">
        <svg className="sidebar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="sidebar-search-input"
          type="text"
          placeholder="Search people"
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      {/* Last chats header */}
      <div className="sidebar-chats-header">
        <span className="sidebar-chats-label">
          {isInlineSearching ? 'People' : isDeleteMode ? `${selectedToDelete.length} selected` : 'Last chats'}
        </span>
        <div className="sidebar-header-actions">
          {!isInlineSearching && !isCreatingGroup && (
            <>
              {isDeleteMode ? (
                <>
                  <button className="sidebar-action-btn cancel" onClick={() => { setIsDeleteMode(false); setSelectedToDelete([]); }}>
                    Cancel
                  </button>
                  <button className="sidebar-action-btn delete" onClick={handleBatchDelete} disabled={selectedToDelete.length === 0}>
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button className="sidebar-group-btn" type="button" onClick={startGroupCreation}>
                    New Group
                  </button>
                  <button className="sidebar-icon-btn" title="Delete chats" onClick={() => setIsDeleteMode(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {isCreatingGroup && (
        <div className="sidebar-group-panel">
          <input
            type="text"
            className="sidebar-group-name"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <p className="sidebar-group-help">Search and select at least 2 people</p>
          {selectedGroupUsers.length > 0 && (
            <p className="sidebar-group-count">Selected: {selectedGroupUsers.length}</p>
          )}
          {groupError && <p className="sidebar-group-error">{groupError}</p>}
          <div className="sidebar-group-actions">
            <button type="button" className="sidebar-group-cancel" onClick={cancelGroupCreation}>Cancel</button>
            <button type="button" className="sidebar-group-create" onClick={submitCreateGroup}>Create</button>
          </div>
        </div>
      )}

      {/* Conversation list */}
      <ul className="conversation-list">
        {isInlineSearching ? (
          <>
            {searching && <li className="search-status">Searching...</li>}
            {!searching && searchResults.length === 0 && (
              <li className="search-status">No users found</li>
            )}
            {!searching && searchResults.map((u) => (
              <li key={u._id}>
                <button
                  className={`conv-item${isCreatingGroup && selectedGroupUsers.includes(u._id) ? ' active' : ''}`}
                  onClick={() => handleSelectUser(u._id)}
                >
                  <span className="conv-avatar-wrap">
                    <UserAvatar user={u} className="conv-avatar" />
                    <span
                      className={`presence-dot${isUserOnline(u._id) ? ' online' : ''}`}
                      aria-label={isUserOnline(u._id) ? 'Online' : 'Offline'}
                    />
                  </span>
                  <div className="conv-info">
                    <div className="conv-row-top">
                      <span className="conv-name">{u.name}</span>
                    </div>
                    <div className="conv-row-bottom">
                      <span className="conv-last">
                        <span className={isUserOnline(u._id) ? 'presence-text online' : 'presence-text'}>
                          {isUserOnline(u._id) ? 'Online' : 'Offline'}
                        </span>
                        <span className="conv-status-separator"> · </span>
                        {u.email}
                      </span>
                      {isCreatingGroup && selectedGroupUsers.includes(u._id) && (
                        <span className="unread-badge">✓</span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </>
        ) : (
          <>
            {conversations.length === 0 && (
              <li className="no-conversations">No conversations yet.</li>
            )}
            {conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              if (!conv.isGroup && !other) return null;
              const unread = unreadCounts[conv._id] || 0;
              const isActive = activeConversation?._id === conv._id;
              const isOtherTyping = isTyping[conv._id];
              const title = getConversationTitle(conv);
              const subtitle = getConversationSubtitle(conv, isOtherTyping);
              const avatarUser = conv.isGroup
                ? { name: conv.groupName || 'Group' }
                : other;
              const otherIsOnline = !conv.isGroup && other ? isUserOnline(other._id) : false;

              return (
                <li key={conv._id}>
                  <button
                    className={`conv-item${isActive ? ' active' : ''}${isDeleteMode ? ' delete-mode' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    {isDeleteMode && (
                      <div className="conv-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedToDelete.includes(conv._id)} 
                          readOnly 
                        />
                      </div>
                    )}
                    <span className="conv-avatar-wrap">
                      <UserAvatar user={avatarUser} className="conv-avatar" />
                      {!conv.isGroup && (
                        <span
                          className={`presence-dot${otherIsOnline ? ' online' : ''}`}
                          aria-label={otherIsOnline ? 'Online' : 'Offline'}
                        />
                      )}
                    </span>
                    <div className="conv-info">
                      <div className="conv-row-top">
                        <span className="conv-name">{title}</span>
                        <span className="conv-time">{formatTime(conv.updatedAt)}</span>
                      </div>
                      <div className="conv-row-bottom">
                        <span className={isOtherTyping ? 'conv-typing' : 'conv-last'}>
                          {!conv.isGroup && !isOtherTyping && (
                            <>
                              <span className={otherIsOnline ? 'presence-text online' : 'presence-text'}>
                                {otherIsOnline ? 'Online' : 'Offline'}
                              </span>
                              <span className="conv-status-separator"> · </span>
                            </>
                          )}
                          {subtitle}
                        </span>
                        {unread > 0 && (
                          <span className="unread-badge">{unread > 9 ? '9+' : unread}</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </>
        )}
      </ul>

      <div className="sidebar-account-panel">
        <button className="sidebar-profile-btn" type="button" onClick={handleOpenProfile}>
          <span className="sidebar-profile-avatar-wrap">
            <UserAvatar user={user} className="sidebar-profile-avatar" />
            <span className="presence-dot online" aria-label="Online" />
          </span>
          <span className="sidebar-profile-meta">
            <span className="sidebar-profile-name">{user?.name}</span>
            <span className="sidebar-profile-email">Online · {user?.email}</span>
          </span>
        </button>
        <div className="sidebar-account-actions">
          <button
            className="sidebar-account-action"
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
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
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button className="sidebar-account-action" type="button" onClick={handleOpenTeamManagement}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Team</span>
          </button>
          <button className="sidebar-account-action danger" type="button" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
