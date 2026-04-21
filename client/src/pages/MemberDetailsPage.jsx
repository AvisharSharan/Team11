import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMemberById } from '../api/memberApi';
import '../styles/MemberDetailsPage.css';

const teamName = 'Team 11';

const MemberDetailsPage = () => {
  const navigate = useNavigate();
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

  return (
    <div className="member-details-page">
      <main className="member-details-card">
        <header className="member-details-head">
          <div>
            <h1>Member details</h1>
          </div>
          <button type="button" className="member-details-back-btn" onClick={() => navigate('/view-members')}>
            Back to members
          </button>
        </header>

        {loading ? <p className="member-details-status">Loading member details...</p> : null}
        {error ? <p className="member-details-status member-details-error">{error}</p> : null}

        {!loading && !error && member ? (
          <>
            <section className="member-details-hero">
              <div className="member-details-image-wrap">
                {imageSrc ? (
                  <img src={imageSrc} alt={member.name} className="member-details-image" />
                ) : (
                  <div className="member-details-avatar tone-6">{member.name?.[0]?.toUpperCase()}</div>
                )}
              </div>

              <div className="member-details-hero-info">
                <span className="member-details-team-badge">{member.teamName || teamName}</span>
                <h2 className="member-details-name">{member.name}</h2>
                <p className="member-details-role">{member.role}</p>
                <a className="member-details-contact-link" href={`mailto:${member.email}`}>
                  {member.email}
                </a>
              </div>
            </section>

            <section className="member-details-section">
              <h3>All details</h3>
              <dl className="member-details-meta">
                <div className="member-details-meta-row">
                  <dt>Team</dt>
                  <dd>{member.teamName || teamName}</dd>
                </div>
                <div className="member-details-meta-row">
                  <dt>Roll no.</dt>
                  <dd>{member.rollNo || member.rollNumber}</dd>
                </div>
                <div className="member-details-meta-row">
                  <dt>Email</dt>
                  <dd>{member.email}</dd>
                </div>
                <div className="member-details-meta-row">
                  <dt>Role</dt>
                  <dd>{member.role}</dd>
                </div>
                <div className="member-details-meta-row">
                  <dt>Member ID</dt>
                  <dd className="member-details-mono">{member._id}</dd>
                </div>
                <div className="member-details-meta-row">
                  <dt>Created</dt>
                  <dd>{member.createdAt ? new Date(member.createdAt).toLocaleString() : '-'}</dd>
                </div>
                <div className="member-details-meta-row">
                  <dt>Updated</dt>
                  <dd>{member.updatedAt ? new Date(member.updatedAt).toLocaleString() : '-'}</dd>
                </div>
              </dl>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default MemberDetailsPage;