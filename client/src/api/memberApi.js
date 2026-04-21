import api from './axiosInstance';

export const uploadMemberPhoto = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/upload', formData);
    return data;
};

export const createMember = async (payload) => {
    const { data } = await api.post('/members', payload);
    return data;
};

export const fetchAllMembers = async () => {
    const { data } = await api.get('/members');
    return data;
};

export default api;