import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/MemberDetailsPage.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const UPLOADS_BASE = `${API_BASE}/uploads`;
const FALLBACK_IMG =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%2364748b">No Image</text></svg>';

const formatDate = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '—';
    }
};

const MemberDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const { data } = await axios.get(`${API_BASE}/members/${id}`);
                const payload = data?.data || data;
                if (!cancelled) setMember(payload);
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || err.message || 'Failed to load member');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleDelete = async () => {
        const confirmed = window.confirm(`Delete ${member?.name}? This cannot be undone.`);
        if (!confirmed) return;

        try {
            setDeleting(true);
            await axios.delete(`${API_BASE}/members/${id}`);
            navigate('/members');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to delete member');
            setDeleting(false);
        }
    };

    const handleImageError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = FALLBACK_IMG;
    };

    if (loading) {
        return (
            <div className="member-details-page">
                <div className="member-details-card">
                    <p className="member-details-status">Loading member…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="member-details-page">
                <div className="member-details-card">
                    <p className="member-details-status member-details-error">{error}</p>
                    <div className="member-details-actions">
                        <button
                            type="button"
                            className="member-details-back-btn"
                            onClick={() => navigate('/members')}
                        >
                            Back to members
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!member) return null;

    const imageUrl = member.profileImage ? `${UPLOADS_BASE}/${member.profileImage}` : FALLBACK_IMG;

    return (
        <div className="member-details-page">
            <div className="member-details-card">
                <div className="member-details-head">
                    <h1>Member Details</h1>
                    <button
                        type="button"
                        className="member-details-back-btn"
                        onClick={() => navigate('/members')}
                    >
                        Back to members
                    </button>
                </div>

                <div className="member-details-hero">
                    <div className="member-details-image-wrap">
                        <img
                            src={imageUrl}
                            alt={member.name}
                            onError={handleImageError}
                            className="member-details-image"
                        />
                    </div>
                    <div className="member-details-hero-info">
                        <h2 className="member-details-name">{member.name}</h2>
                        <p className="member-details-role">{member.role}</p>
                        {member.email && (
                            <a href={`mailto:${member.email}`} className="member-details-contact-link">
                                {member.email}
                            </a>
                        )}
                        {member.phone && (
                            <a href={`tel:${member.phone}`} className="member-details-contact-link">
                                {member.phone}
                            </a>
                        )}
                    </div>
                </div>

                {member.bio && (
                    <section className="member-details-section">
                        <h3>About</h3>
                        <p className="member-details-bio">{member.bio}</p>
                    </section>
                )}

                <section className="member-details-section">
                    <h3>Information</h3>
                    <dl className="member-details-meta">
                        <div className="member-details-meta-row">
                            <dt>Member ID</dt>
                            <dd className="member-details-mono">{member._id}</dd>
                        </div>
                        <div className="member-details-meta-row">
                            <dt>Joined</dt>
                            <dd>{formatDate(member.createdAt)}</dd>
                        </div>
                        <div className="member-details-meta-row">
                            <dt>Last updated</dt>
                            <dd>{formatDate(member.updatedAt)}</dd>
                        </div>
                        <div className="member-details-meta-row">
                            <dt>Profile image</dt>
                            <dd className="member-details-mono">{member.profileImage || '—'}</dd>
                        </div>
                    </dl>
                </section>

                <div className="member-details-actions">
                    <button
                        type="button"
                        className="member-details-delete-btn"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting…' : 'Delete member'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberDetailsPage;