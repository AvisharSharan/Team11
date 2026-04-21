import React from 'react';
import useAuthStore from '../store/useAuthStore';
import '../styles/components/MessageBubble.css';

const avatarTone = (name = '') => `tone-${name.charCodeAt(0) % 8}`;

const MessageBubble = ({ message }) => {
  const { user } = useAuthStore();
  const isSent = (message.sender?._id || message.sender) === user._id;

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const senderName = typeof message.sender === 'object' ? message.sender.name : 'User';
  const initials = (senderName || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const renderFileContent = () => {
    if (!message.fileUrl) return null;

    const handleDownload = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(message.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', message.fileName || 'attachment');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to opening in new tab if blob fetch fails
        window.open(message.fileUrl, '_blank');
      }
    };

    if (message.fileType === 'image') {
      return (
        <div className="message-file-image">
          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
            <img src={message.fileUrl} alt="uploaded" className="chat-img-preview" />
          </a>
        </div>
      );
    }

    const displayName = message.fileName || 'Attachment';

    return (
      <div className="message-file-raw">
        <button 
          onClick={handleDownload}
          className="file-download-btn-wrapper"
        >
          <div className="file-download-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="file-icon">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            <span className="file-name-text">{displayName}</span>
          </div>
        </button>
      </div>
    );
  };

  if (isSent) {
    return (
      <div className="msg-row msg-sent">
        <div className="msg-sent-body">
          <div className="bubble-sent">
            {renderFileContent()}
            {message.content && <p className="bubble-text">{message.content}</p>}
          </div>
          <span className="msg-time-sent">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-row msg-received">
      <div className={`msg-avatar ${avatarTone(senderName)}`}>
        {initials}
      </div>
      <div className="msg-recv-body">
        <div className="msg-meta">
          <span className="msg-sender-name">{senderName}</span>
          <span className="msg-time-recv">{formatTime(message.createdAt)}</span>
        </div>
        <div className="bubble-received">
          {renderFileContent()}
          {message.content && <p className="bubble-text">{message.content}</p>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
