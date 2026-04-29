const NOTIFICATION_TAG_PREFIX = 'chat-message';

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Notification permission request failed:', error);
    return 'denied';
  }
};

const buildNotificationBody = (message) => {
  if (message.content?.trim()) {
    return message.content.trim();
  }

  if (message.fileName) {
    return `Sent an attachment: ${message.fileName}`;
  }

  if (message.fileType === 'image') {
    return 'Sent an image';
  }

  return 'Sent a message';
};

export const showMessageNotification = (message) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  const senderName = message.sender?.name || 'New message';
  const notification = new Notification(senderName, {
    body: buildNotificationBody(message),
    tag: `${NOTIFICATION_TAG_PREFIX}-${message._id || message.conversationId}`,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};
