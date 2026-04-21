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
