import React from 'react';
import { getAvatarTone, getInitials } from '../utils/avatar';

const UserAvatar = ({ user, className = '', fallbackName, alt }) => {
  const name = user?.name || fallbackName || 'User';
  const profilePicture = user?.profilePicture;
  const classes = [className, !profilePicture ? getAvatarTone(name) : ''].filter(Boolean).join(' ');

  if (profilePicture) {
    return (
      <div className={classes}>
        <img src={profilePicture} alt={alt || `${name} profile`} className="avatar-image" />
      </div>
    );
  }

  return <div className={classes}>{getInitials(name)}</div>;
};

export default UserAvatar;
