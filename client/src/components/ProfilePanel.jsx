import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import useAuthStore from '../store/useAuthStore';
import UserAvatar from './UserAvatar';
import '../styles/components/ProfilePanel.css';

const ProfilePanel = ({ mode, user, onClose, onProfileSaved }) => {
  const { updateProfile, loading, error: authError } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setProfilePicture(user?.profilePicture || '');
    setLocalError('');
  }, [user]);

  if (!user) return null;

  const isEditMode = mode === 'edit';

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setLocalError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfilePicture(data.fileUrl);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Profile picture upload failed');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    try {
      const updatedUser = await updateProfile({ name, bio, profilePicture });
      onProfileSaved?.(updatedUser);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Profile update failed');
    }
  };

  return (
    <div className="profile-panel-overlay" onClick={onClose}>
      <aside
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
        aria-label={isEditMode ? 'Edit profile panel' : 'User profile panel'}
      >
        <div className="profile-panel-head">
          <div>
            <p className="profile-panel-kicker">{isEditMode ? 'Profile management' : 'User profile'}</p>
            <h2>{isEditMode ? 'Edit your profile' : 'Profile details'}</h2>
          </div>
          <button type="button" className="profile-panel-close" onClick={onClose} aria-label="Close profile panel">
            X
          </button>
        </div>

        <div className="profile-panel-summary">
          <UserAvatar user={{ ...user, profilePicture }} className="profile-panel-avatar" />
          <div className="profile-panel-summary-text">
            <h3>{isEditMode ? name || user.name : user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        {isEditMode ? (
          <form className="profile-panel-form" onSubmit={handleSubmit}>
            <label className="profile-panel-field">
              <span>Profile picture</span>
              <input type="file" accept="image/*" onChange={handleUpload} disabled={isUploading || loading} />
            </label>

            <label className="profile-panel-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                required
              />
            </label>

            <label className="profile-panel-field">
              <span>Email</span>
              <input type="email" value={user.email} disabled />
            </label>

            <label className="profile-panel-field">
              <span>Bio</span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={240}
                rows={5}
                placeholder="Tell people a bit about yourself"
              />
              <small>{bio.length}/240</small>
            </label>

            {(localError || authError) && <p className="profile-panel-error">{localError || authError}</p>}

            <div className="profile-panel-actions">
              <button type="button" className="profile-panel-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="profile-panel-primary" disabled={loading || isUploading}>
                {loading ? 'Saving...' : isUploading ? 'Uploading...' : 'Save profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-panel-details">
            <div className="profile-panel-item">
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="profile-panel-item">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className="profile-panel-item">
              <span>Bio</span>
              <p>{user.bio?.trim() || 'No bio added yet.'}</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ProfilePanel;
