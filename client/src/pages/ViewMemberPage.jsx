import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAllMembers } from '../api/memberApi';
import '../styles/ViewMemberPage.css';

const teamName = 'Team 11';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const ViewMemberPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.message || '');

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const response = await fetchAllMembers();
        setMembers(response.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load members.');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const openMemberDetails = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  return (
    <div className="view-member-page">
      <main className="view-member-card">
        <header className="view-member-head">
          <div>
            <h1>Team members</h1>
            <p className="view-member-team">
              Team name: <strong>{teamName}</strong> {members.length ? `• ${members.length} member${members.length === 1 ? '' : 's'}` : ''}
            </p>
          </div>
          <button type="button" className="view-member-back-btn" onClick={() => navigate('/chat')}>
            Back to chat
          </button>
        </header>

        {notice ? <p className="view-member-status view-member-success">{notice}</p> : null}
        {error ? <p className="view-member-status view-member-error">{error}</p> : null}
        {loading ? <p className="view-member-status">Loading members...</p> : null}

        {!loading && !error && members.length === 0 ? (
          <div className="view-member-empty">No members have been added yet.</div>
        ) : null}

        {!loading && members.length > 0 ? (
          <section className="member-grid">
            {members.map((member) => {
              const imageSrc = member.profileImage || member.photoUrl || '';
              const initials = getInitials(member.name);

              return (
                <article key={member._id} className="member-tile">
                  <div className="member-tile-image-wrap">
                    {imageSrc ? (
                      <img src={imageSrc} alt={member.name} className="member-tile-image" />
                    ) : (
                      <div className="member-tile-avatar tone-6">{initials}</div>
                    )}
                  </div>

                  <div className="member-tile-body">
                    <span className="member-team-badge">{member.teamName || teamName}</span>
                    <h2 className="member-tile-name">{member.name}</h2>
                    <p className="member-tile-role">{member.role}</p>
                    <p className="member-tile-roll">Roll No. {member.rollNo || member.rollNumber}</p>
                    <button type="button" className="member-tile-btn" onClick={() => openMemberDetails(member._id)}>
                      View Details
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default ViewMemberPage;