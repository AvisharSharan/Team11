import api from './axiosInstance';

export const createMember = async (formData) => {
    const { data } = await api.post('/members', formData);
    return data;
};

export const fetchAllMembers = async () => {
    const { data } = await api.get('/members');
    return data;
};

export const fetchMemberById = async (memberId) => {
    const { data } = await api.get(`/members/${memberId}`);
    return data;
};

export const deleteMember = async (memberId) => {
    const { data } = await api.delete(`/members/${memberId}`);
    return data;
};

export default api;