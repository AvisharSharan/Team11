import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AddMemberPage.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const initialForm = {
  name: '',
  role: '',
  email: '',
  phone: '',
  bio: '',
};

const AddMemberPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setError(null);
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(initialForm);
    setProfileImage(null);
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.name.trim() || !form.role.trim()) {
      setError('Name and role are required');
      return;
    }
    if (!profileImage) {
      setError('Please upload a profile image');
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      payload.append('profileImage', profileImage);

      await axios.post(`${API_BASE}/members`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000,
      });

      setSuccess(true);
      resetForm();

      setTimeout(() => navigate('/members'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="add-member-page">
        <div className="add-member-card">
          <div className="add-member-head">
            <h1>Add Member</h1>
            <button
                type="button"
                className="add-member-back-btn"
                onClick={() => navigate('/members')}
            >
              Back to members
            </button>
          </div>

          <form className="add-member-form" onSubmit={handleSubmit} noValidate>
            <div className="add-member-image-section">
              <div className="add-member-preview">
                {preview ? (
                    <img src={preview} alt="Preview" className="add-member-preview-img" />
                ) : (
                    <span className="add-member-preview-placeholder">No image</span>
                )}
              </div>
              <label className="add-member-file-label">
                <span>Choose profile image</span>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="add-member-file-input"
                />
              </label>
            </div>

            <div className="add-member-field">
              <label htmlFor="name">Name *</label>
              <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  required
              />
            </div>

            <div className="add-member-field">
              <label htmlFor="role">Role *</label>
              <input
                  id="role"
                  name="role"
                  type="text"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Full-Stack Engineer"
                  required
              />
            </div>

            <div className="add-member-row">
              <div className="add-member-field">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                />
              </div>

              <div className="add-member-field">
                <label htmlFor="phone">Phone</label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="add-member-field">
              <label htmlFor="bio">Bio</label>
              <textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Short description..."
                  rows={4}
              />
            </div>

            {error && <p className="add-member-status add-member-error">{error}</p>}
            {success && (
                <p className="add-member-status add-member-success">
                  Member added successfully. Redirecting…
                </p>
            )}

            <div className="add-member-actions">
              <button
                  type="button"
                  className="add-member-secondary-btn"
                  onClick={resetForm}
                  disabled={submitting}
              >
                Reset
              </button>
              <button type="submit" className="add-member-submit-btn" disabled={submitting}>
                {submitting ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AddMemberPage;