import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://13.234.36.99:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
