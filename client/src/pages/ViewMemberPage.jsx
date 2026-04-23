import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAllMembers } from '../api/memberApi';
import '../styles/ViewMemberPage.css';

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
      <div className="view-member-container">
        <h1 className="view-member-title">MEET OUR AMAZING TEAM</h1>

        {notice ? <p className="view-member-success">{notice}</p> : null}
        {error ? <p className="view-member-error">{error}</p> : null}
        {loading ? <p className="view-member-loading">Loading members...</p> : null}

        {!loading && !error && members.length === 0 ? (
          <div className="view-member-empty">No members have been added yet.</div>
        ) : null}

        {!loading && members.length > 0 ? (
          <section className="member-grid">
            {members.map((member) => {
              const imageSrc = member.profileImage || member.photoUrl || '';

              return (
                <article key={member._id} className="member-card">
                  <div className="member-card-image">
                    {imageSrc ? (
                      <img src={imageSrc} alt={member.name} className="member-image" />
                    ) : (
                      <div className="member-placeholder">No Image</div>
                    )}
                  </div>

                  <div className="member-card-content">
                    <h2 className="member-name">{member.name}</h2>
                    <p className="member-roll">Roll Number: {member.rollNo || member.rollNumber || '-'}</p>
                    <button 
                      type="button" 
                      className="member-details-btn" 
                      onClick={() => openMemberDetails(member._id)}
                    >
                      VIEW DETAILS
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default ViewMemberPage;