import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TeamManagementPage.css';

const TeamManagementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="team-management-page">
      <div className="team-management-container">
        <h1 className="team-title">TEAM 11</h1>
        <p className="team-subtitle">Welcome to the Team 11 Management</p>
        
        <div className="team-management-card">
          <h2 className="team-card-title">Manage Team</h2>
          <div className="team-actions">
            <button
              className="team-action-btn add-member-btn"
              onClick={() => navigate('/add-member')}
              type="button"
            >
              Add Member
            </button>
            <button
              className="team-action-btn view-members-btn"
              onClick={() => navigate('/members')}
              type="button"
            >
              View Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPage;
