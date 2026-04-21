import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMember } from '../api/memberApi';
import '../styles/AddMemberPage.css';

const initialForm = {
  name: '',
  email: '',
  rollNo: '',
  role: '',
  profileImage: null,
};

const AddMemberPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormData((current) => ({ ...current, profileImage: file }));

    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl((currentPreview) => {
      if (currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
      return nextPreview;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.profileImage) {
      setError('Profile picture is required.');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('email', formData.email.trim());
    payload.append('rollNo', formData.rollNo.trim());
    payload.append('role', formData.role.trim());
    payload.append('profileImage', formData.profileImage);

    try {
      setLoading(true);
      await createMember(payload);
      navigate('/view-members', {
        replace: true,
        state: { message: 'Member saved successfully.' },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save member.');
    } finally {
      setLoading(false);
    }
  };

  const imagePreview = previewUrl || '';

  return (
    <div className="add-member-page">
      <main className="add-member-card">
        <header className="add-member-head">
          <div>
            <h1>Add a team member</h1>
            <p className="add-member-copy">
              Fill in the member details and upload a profile picture. The entry is stored in the local MongoDB database.
            </p>
          </div>
          <button type="button" className="add-member-back-btn" onClick={() => navigate('/chat')}>
            Back to chat
          </button>
        </header>

        <form className="add-member-form" onSubmit={handleSubmit}>
          <section className="add-member-image-section">
            <div className="add-member-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Selected profile preview" className="add-member-preview-img" />
              ) : (
                <span className="add-member-preview-placeholder">Preview</span>
              )}
            </div>

            <div className="add-member-file-copy">
              <p className="add-member-file-hint">
                Upload a JPG or PNG image. This will be served from the local server and linked to the member record.
              </p>
              <label className="add-member-file-label" htmlFor="profileImage">
                Choose profile picture
              </label>
              <input
                id="profileImage"
                className="add-member-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>
          </section>

          <div className="add-member-row">
            <div className="add-member-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="add-member-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="jane@example.com"
                required
              />
            </div>
          </div>

          <div className="add-member-row">
            <div className="add-member-field">
              <label htmlFor="rollNo">Roll no.</label>
              <input
                id="rollNo"
                type="text"
                value={formData.rollNo}
                onChange={(event) => updateField('rollNo', event.target.value)}
                placeholder="11-001"
                required
              />
            </div>
            <div className="add-member-field">
              <label htmlFor="role">Role</label>
              <input
                id="role"
                type="text"
                value={formData.role}
                onChange={(event) => updateField('role', event.target.value)}
                placeholder="Frontend Developer"
                required
              />
            </div>
          </div>

          {error ? <p className="add-member-status add-member-error">{error}</p> : null}

          <div className="add-member-actions">
            <button type="button" className="add-member-secondary-btn" onClick={() => navigate('/view-members')}>
              View members
            </button>
            <button type="submit" className="add-member-submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save member'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddMemberPage;