import api from './axiosInstance';

export const createMember = async (formData) => {
    const { data } = await api.post('/members', formData);
    return data;
};

export const fetchAllMembers = async () => {
    const { data } = await api.get('/members');
    // Support both wrapped ({ data }) and plain-array API responses.
    if (Array.isArray(data)) {
        return { data };
    }
    return data;
};

export const fetchMemberById = async (memberId) => {
    const { data } = await api.get(`/members/${memberId}`);
    // Support both wrapped ({ data }) and plain-object API responses.
    if (data && !data.data) {
        return { data };
    }
    return data;
};

export default api;