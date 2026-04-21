import React from 'react';
import { useNavigate } from 'react-router-dom';

const FALLBACK_IMG =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%2364748b">No Image</text></svg>';

const MemberTile = ({ member }) => {
    const navigate = useNavigate();
    const imageUrl = member.photoUrl || member.profileImage || FALLBACK_IMG;

    const handleError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = FALLBACK_IMG;
    };

    return (
        <article className="member-tile">
            <div className="member-tile-image-wrap">
                <img
                    src={imageUrl}
                    alt={member.name}
                    onError={handleError}
                    className="member-tile-image"
                    loading="lazy"
                />
            </div>
            <div className="member-tile-body">
                <h3 className="member-tile-name">{member.name}</h3>
                <p className="member-tile-role">{member.role}</p>
                <button
                    type="button"
                    className="member-tile-btn"
                    onClick={() => navigate(`/members/${member._id}`)}
                >
                    View Details
                </button>
            </div>
        </article>
    );
};

export default MemberTile;