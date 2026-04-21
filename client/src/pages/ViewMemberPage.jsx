import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllMembers } from '../api/memberApi';
import MemberTile from '../components/MemberTile';
import '../styles/ViewMemberPage.css';

const ViewMemberPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchAllMembers();
        const list = Array.isArray(res) ? res : res.data || [];
        if (!cancelled) setMembers(list);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load members');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
      <div className="view-member-page">
        <div className="view-member-card">
          <div className="view-member-head">
            <h1>Team Members</h1>
            <button
                type="button"
                className="view-member-back-btn"
                onClick={() => navigate('/chat')}
            >
              Back to chat
            </button>
          </div>

          {loading && <p className="view-member-status">Loading members…</p>}
          {error && <p className="view-member-status view-member-error">{error}</p>}

          {!loading && !error && members.length === 0 && (
              <p className="view-member-status">No members found.</p>
          )}

          {!loading && !error && members.length > 0 && (
              <section className="member-grid">
                {members.map((m) => (
                    <MemberTile key={m._id} member={m} />
                ))}
              </section>
          )}
        </div>
      </div>
  );
};

export default ViewMemberPage;