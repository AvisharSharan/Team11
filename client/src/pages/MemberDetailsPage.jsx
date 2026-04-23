import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMemberById } from '../api/memberApi';
import '../styles/MemberDetailsPage.css';

const MemberDetailsPage = () => {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMember = async () => {
      try {
        setLoading(true);
        const response = await fetchMemberById(memberId);
        setMember(response.data || null);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load member details.');
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      loadMember();
    }
  }, [memberId]);

  const imageSrc = member?.profileImage || member?.photoUrl || '';

  const parseHobbies = (hobbiesStr) => {
    if (!hobbiesStr) return [];
    return hobbiesStr.split(',').map((h) => h.trim()).filter(Boolean);
  };

  const showValue = (value) => {
    if (value === null || value === undefined) return '-';
    const trimmed = String(value).trim();
    return trimmed ? trimmed : '-';
  };

  const hobbies = member ? parseHobbies(member.hobbies) : [];

  return (
    <div className="member-details-page">
      <div className="member-details-container">
        {loading ? <p className="member-details-loading">Loading member details...</p> : null}
        {error ? <p className="member-details-error">{error}</p> : null}

        {!loading && !error && member ? (
          <>
            <div className="member-details-image-section">
              {imageSrc ? (
                <img src={imageSrc} alt={member.name} className="member-details-image" />
              ) : (
                <div className="member-details-placeholder">No Image</div>
              )}
            </div>

            <div className="member-details-info">
              <div className="member-details-summary">
                <h1 className="member-details-name">{showValue(member.name)}</h1>
                <p className="member-details-year">
                  {showValue(member.degree)} - {showValue(member.year)}
                </p>
              </div>

              <div className="member-details-meta">
                <div className="meta-row">
                  <span className="meta-label">Team:</span>
                  <span className="meta-value">{showValue(member.teamName)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Roll Number:</span>
                  <span className="meta-value">{showValue(member.rollNo || member.rollNumber)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Role:</span>
                  <span className="meta-value">{showValue(member.role)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Email:</span>
                  <span className="meta-value">{showValue(member.email)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Projects:</span>
                  <span className="meta-value">{showValue(member.aboutProject)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Certificate:</span>
                  <span className="meta-value">{showValue(member.certificate)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Internship:</span>
                  <span className="meta-value">{showValue(member.internship)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">About Your Aims:</span>
                  <span className="meta-value">{showValue(member.aboutAim)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Member ID:</span>
                  <span className="meta-value">{showValue(member._id)}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Created At:</span>
                  <span className="meta-value">{member.createdAt ? new Date(member.createdAt).toLocaleString() : '-'}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Updated At:</span>
                  <span className="meta-value">{member.updatedAt ? new Date(member.updatedAt).toLocaleString() : '-'}</span>
                </div>
              </div>

              <div className="member-hobbies">
                <span className="hobbies-label">Hobbies:</span>
                {hobbies.length > 0 ? (
                  <div className="hobbies-list">
                    {hobbies.map((hobby, index) => (
                      <span key={index} className="hobby-tag">
                        {hobby}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="meta-value">-</span>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MemberDetailsPage;