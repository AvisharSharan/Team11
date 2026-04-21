import React from 'react';
import { useNavigate } from 'react-router-dom';

const ViewMemberPage = () => {
  const navigate = useNavigate();

  return (
    <div className="view-member-page">
      <div className="view-member-card">
        <div className="view-member-head">
          <h1>View member</h1>
          <button
            type="button"
            className="view-member-back-btn"
            onClick={() => navigate('/chat')}
          >
            Back to chat
          </button>
        </div>
        <p className="view-member-copy">
          This page is ready for your member viewing flow.
        </p>
      </div>
    </div>
  );
};

export default ViewMemberPage;
