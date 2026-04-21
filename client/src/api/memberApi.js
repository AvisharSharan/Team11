import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

export const fetchAllMembers = async () => {
    const { data } = await axiosClient.get('/members');
    return data;
};

export default axiosClient;