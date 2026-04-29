export const getAvatarTone = (name = '') => `tone-${name.charCodeAt(0) % 8}`;

export const getInitials = (name = 'User') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
