import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMember } from '../api/memberApi';
import '../styles/AddMemberPage.css';

const initialForm = {
  name: '',
  email: '',
  rollNo: '',
  role: '',
  year: '',
  degree: '',
  aboutProject: '',
  hobbies: '',
  certificate: '',
  internship: '',
  aboutAim: '',
  profileImage: null,
};

const AddMemberPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [fileName, setFileName] = useState('No file selected');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName('No file selected');
      setFormData((current) => ({ ...current, profileImage: null }));
      return;
    }

    setFileName(file.name);
    setFormData((current) => ({ ...current, profileImage: file }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required.');
      return false;
    }
    if (!formData.rollNo.trim()) {
      setError('Roll Number is required.');
      return false;
    }
    if (!formData.year.trim()) {
      setError('Year is required.');
      return false;
    }
    if (!formData.degree.trim()) {
      setError('Degree is required.');
      return false;
    }
    if (!formData.profileImage) {
      setError('Profile image is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('email', formData.email.trim());
    payload.append('rollNo', formData.rollNo.trim());
    payload.append('role', formData.role.trim());
    payload.append('year', formData.year.trim());
    payload.append('degree', formData.degree.trim());
    payload.append('aboutProject', formData.aboutProject.trim());
    payload.append('hobbies', formData.hobbies.trim());
    payload.append('certificate', formData.certificate.trim());
    payload.append('internship', formData.internship.trim());
    payload.append('aboutAim', formData.aboutAim.trim());
    payload.append('profileImage', formData.profileImage);

    try {
      setLoading(true);
      await createMember(payload);
      navigate('/team-management', {
        replace: true,
        state: { message: 'Member saved successfully.' },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-member-page">
      <div className="add-member-container">
        <h1 className="add-member-title">Add Team Member</h1>

        <form className="add-member-form" onSubmit={handleSubmit}>
          <div className="add-member-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Enter member name"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="rollNo">Roll Number</label>
            <input
              id="rollNo"
              type="text"
              value={formData.rollNo}
              onChange={(event) => updateField('rollNo', event.target.value)}
              placeholder="Enter roll number"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="role">Role</label>
            <input
              id="role"
              type="text"
              value={formData.role}
              onChange={(event) => updateField('role', event.target.value)}
              placeholder="Enter role"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="year">Year</label>
            <input
              id="year"
              type="text"
              value={formData.year}
              onChange={(event) => updateField('year', event.target.value)}
              placeholder="Enter year"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="degree">Degree</label>
            <input
              id="degree"
              type="text"
              value={formData.degree}
              onChange={(event) => updateField('degree', event.target.value)}
              placeholder="Enter degree"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="aboutProject">About Project</label>
            <textarea
              id="aboutProject"
              value={formData.aboutProject}
              onChange={(event) => updateField('aboutProject', event.target.value)}
              placeholder="Enter project details"
              rows="4"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="hobbies">Hobbies (comma separated)</label>
            <input
              id="hobbies"
              type="text"
              value={formData.hobbies}
              onChange={(event) => updateField('hobbies', event.target.value)}
              placeholder="e.g., Reading, Gaming, Coding"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="certificate">Certificate</label>
            <input
              id="certificate"
              type="text"
              value={formData.certificate}
              onChange={(event) => updateField('certificate', event.target.value)}
              placeholder="Enter certificate details"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="internship">Internship</label>
            <input
              id="internship"
              type="text"
              value={formData.internship}
              onChange={(event) => updateField('internship', event.target.value)}
              placeholder="Enter internship details"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="aboutAim">About Your Aim</label>
            <textarea
              id="aboutAim"
              value={formData.aboutAim}
              onChange={(event) => updateField('aboutAim', event.target.value)}
              placeholder="Enter your aims and goals"
              rows="4"
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="profileImage">Profile Image</label>
            <div className="add-member-file-wrapper">
              <label className="add-member-browse-btn" htmlFor="profileImage">
                Browse...
              </label>
              <span className="add-member-file-name">{fileName}</span>
              <input
                id="profileImage"
                className="add-member-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {error ? <p className="add-member-error">{error}</p> : null}

          <button type="submit" className="add-member-submit-btn" disabled={loading}>
            {loading ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMemberPage;