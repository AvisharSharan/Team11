import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddMemberPage = () => {
  const navigate = useNavigate();

  return (
    <div className="add-member-page">
      <div className="add-member-card">
        <div className="add-member-head">
          <h1>Add member</h1>
          <button
            type="button"
            className="add-member-back-btn"
            onClick={() => navigate('/chat')}
          >
            Back to chat
          </button>
        </div>
        <p className="add-member-copy">
          This page is ready for your add-member flow.
        </p>
      </div>
    </div>
  );
};

export default AddMemberPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddMemberPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', rollNumber: '', year: '', degree: '',
    email: '', role: '', aboutProject: '',
    hobbies: '', certificate: '', internship: '', aboutAim: '',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
      setErrors({ ...errors, photo: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!form.year) newErrors.year = 'Please select a year';
    if (!form.degree.trim()) newErrors.degree = 'Degree is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.role.trim()) newErrors.role = 'Role is required';
    if (!form.aboutProject.trim()) newErrors.aboutProject = 'Please describe your project';
    if (!photo) newErrors.photo = 'Please upload a profile photo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    formData.append('photo', photo);

    try {
      await axios.post('/members', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      alert('Submission failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, as }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {as === 'textarea' ? (
        <textarea name={name} value={form[name]} onChange={handleChange}
          placeholder={placeholder} style={{ ...inputStyle, minHeight: 80, resize: 'vertical',
            borderColor: errors[name] ? '#E24B4A' : undefined }} />
      ) : as === 'select' ? (
        <select name={name} value={form[name]} onChange={handleChange}
          style={{ ...inputStyle, borderColor: errors[name] ? '#E24B4A' : undefined }}>
          <option value="">Select year</option>
          {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y}>{y}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={form[name]} onChange={handleChange}
          placeholder={placeholder} style={{ ...inputStyle,
            borderColor: errors[name] ? '#E24B4A' : undefined }} />
      )}
      {errors[name] && <span style={errStyle}>{errors[name]}</span>}
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>Add Team Member</h1>
          <button onClick={() => navigate('/chat')} style={backBtnStyle}>← Back to chat</button>
        </div>

        {success && (
          <div style={successBannerStyle}>Member added successfully! Redirecting...</div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={rowStyle}>
            <Field label="Name" name="name" placeholder="Full name" />
            <Field label="Roll Number" name="rollNumber" placeholder="e.g. 21CS101" />
          </div>
          <div style={rowStyle}>
            <Field label="Year" name="year" as="select" />
            <Field label="Degree" name="degree" placeholder="e.g. B.Tech CSE" />
          </div>
          <div style={rowStyle}>
            <Field label="Email" name="email" type="email" placeholder="email@example.com" />
            <Field label="Role" name="role" placeholder="e.g. Frontend Developer" />
          </div>
          <Field label="About Project" name="aboutProject" as="textarea"
            placeholder="Brief description of your project..." />
          <div style={rowStyle}>
            <Field label="Hobbies (comma separated)" name="hobbies" placeholder="Reading, Coding..." />
            <Field label="Certificate" name="certificate" placeholder="e.g. AWS Practitioner" />
          </div>
          <div style={rowStyle}>
            <Field label="Internship" name="internship" placeholder="Company or role" />
            <Field label="About Your Aim" name="aboutAim" as="textarea"
              placeholder="Your career goal..." />
          </div>

          {/* Photo Upload */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Profile Photo</label>
            <label style={uploadZoneStyle}>
              <input type="file" accept="image/*" onChange={handlePhoto}
                style={{ display: 'none' }} />
              {preview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={preview} alt="preview"
                    style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: 13, color: '#555' }}>{photo?.name}</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
                  <div style={{ fontSize: 13, color: '#888' }}>Click to upload a professional photo</div>
                </div>
              )}
            </label>
            {errors.photo && <span style={errStyle}>{errors.photo}</span>}
          </div>

          <button type="submit" disabled={loading} style={submitBtnStyle}>
            {loading ? 'Submitting...' : 'SUBMIT'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles
const pageStyle = { minHeight: '100vh', background: '#f5f5f5', display: 'flex', justifyContent: 'center', padding: '2rem 1rem' };
const cardStyle = { background: '#fff', borderRadius: 12, border: '0.5px solid #e0e0e0', width: '100%', maxWidth: 560, padding: '2rem', height: 'fit-content' };
const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const labelStyle = { fontSize: 12, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', fontSize: 14, padding: '9px 12px', border: '0.5px solid #d0d0d0', borderRadius: 8, outline: 'none', background: '#fff' };
const errStyle = { fontSize: 12, color: '#E24B4A' };
const uploadZoneStyle = { display: 'block', border: '1px dashed #ccc', borderRadius: 8, padding: 18, cursor: 'pointer', marginTop: 6 };
const submitBtnStyle = { width: '100%', padding: 11, background: '#185FA5', color: '#fff', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 8 };
const backBtnStyle = { fontSize: 13, color: '#666', background: 'none', border: '0.5px solid #ccc', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' };
const successBannerStyle = { background: '#eaf3de', color: '#3B6D11', border: '0.5px solid #639922', borderRadius: 8, padding: '12px 16px', fontSize: 14, marginBottom: 16 };

export default AddMemberPage;
