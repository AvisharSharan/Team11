import React, { useEffect, useRef, useState, useCallback } from 'react';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { getSocket } from '../socket/socket';
import MessageBubble from './MessageBubble';
import UserAvatar from './UserAvatar';
import '../styles/components/ChatWindow.css';

const ChatWindow = ({ onViewProfile }) => {
  const { activeConversation, messages, fetchMessages, sendMessage, sendFile, loadingMessages, isTyping } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const other = activeConversation?.participants?.find((p) => p._id !== user._id);
  const headerTitle = activeConversation?.isGroup
    ? (activeConversation.groupName || 'Group chat')
    : (other?.name || 'Chat');
  const headerSubtitle = activeConversation?.isGroup
    ? `${activeConversation.participants?.length || 0} members`
    : (other?.email || '');

  // Fetch messages and join the socket room when conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    fetchMessages(activeConversation._id);
  }, [activeConversation, fetchMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation) return;

    const socket = getSocket();
    socket.emit('stop typing', { conversationId: activeConversation._id });

    const message = await sendMessage(activeConversation._id, input.trim());
    setInput('');

    if (message) {
      socket.emit('new message', {
        ...message,
        conversationId: activeConversation._id,
      });
    }
  };

  const handleTyping = useCallback(
    (e) => {
      setInput(e.target.value);
      if (!activeConversation) return;

      const socket = getSocket();
      socket.emit('typing', {
        conversationId: activeConversation._id,
        senderName: user.name,
      });

      clearTimeout(typingTimeout);
      const t = setTimeout(() => {
        socket.emit('stop typing', { conversationId: activeConversation._id });
      }, 2000);
      setTypingTimeout(t);
    },
    [activeConversation, typingTimeout, user.name]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConversation) return;

    setIsUploading(true);
    try {
      const message = await sendFile(activeConversation._id, file);
      if (message) {
        const socket = getSocket();
        socket.emit('new message', {
          ...message,
          conversationId: activeConversation._id,
        });
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const typingName = activeConversation && isTyping[activeConversation._id];

  return (
    <div className="chat-window">
      {/* Header — Always visible */}
      <div className="chat-header">
        {activeConversation && (
          <>
            {!activeConversation.isGroup && other && (
              <button
                type="button"
                className="chat-header-avatar-btn"
                onClick={() => onViewProfile?.(other)}
                aria-label={`View ${other.name} profile`}
              >
                <UserAvatar user={other} className="chat-header-avatar" />
              </button>
            )}
            <div
              className={`chat-header-info${!activeConversation.isGroup && other ? ' clickable' : ''}`}
              onClick={!activeConversation.isGroup && other ? () => onViewProfile?.(other) : undefined}
              role={!activeConversation.isGroup && other ? 'button' : undefined}
              tabIndex={!activeConversation.isGroup && other ? 0 : undefined}
              onKeyDown={
                !activeConversation.isGroup && other
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onViewProfile?.(other);
                      }
                    }
                  : undefined
              }
            >
              <div className="chat-header-top">
                <p className="chat-header-name">{headerTitle}</p>
              </div>
              {headerSubtitle && <p className="chat-header-subtitle">{headerSubtitle}</p>}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {!activeConversation ? (
        <div className="chat-empty">
          <div className="chat-empty-inner">
            <div className="chat-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2>No conversation selected</h2>
            <p>Pick a chat from the sidebar or start a new one.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="messages-area">
            {loadingMessages ? (
              <p className="messages-loading">Loading…</p>
            ) : (
              <>
                {messages.length === 0 && (
                  <p className="messages-empty">No messages yet. Say hello! 👋</p>
                )}
                {messages.map((msg) => (
                  <MessageBubble key={msg._id} message={msg} onProfileClick={onViewProfile} />
                ))}
                {typingName && (
                  <p className="typing-text">••• {typingName} is typing</p>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,video/*,.pdf,.docx,.txt"
            />
            <button
              type="button"
              className="attach-btn"
              onClick={triggerFileInput}
              disabled={isUploading}
              aria-label="Attach file"
            >
              {isUploading ? (
                <div className="upload-spinner" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              )}
            </button>
            <textarea
              className="chat-input"
              placeholder={isUploading ? "Uploading file..." : "Write your message..."}
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              disabled={isUploading}
              rows={1}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={(!input.trim() && !isUploading) || isUploading}
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
