import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

class AuthService {
    constructor() {
        this.init();
    }

    init() {
        // Thêm interceptor cho mọi request
        axios.interceptors.request.use(
            (config) => {
                const token = this.getAccessToken();
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Thêm interceptor cho mọi response
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Nếu lỗi 401 và chưa thử refresh token
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = this.getRefreshToken();
                        const response = await this.refreshAccessToken(refreshToken);
                        
                        this.setTokens(response.data.accessToken, response.data.refreshToken);
                        
                        // Thử lại request ban đầu với token mới
                        originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
                        return axios(originalRequest);
                    } catch (err) {
                        // Nếu refresh token cũng hết hạn, logout user
                        this.logout();
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async login(email, password) {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            if (response.data.accessToken) {
                this.setTokens(response.data.accessToken, response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async refreshAccessToken(refreshToken) {
        try {
            return await axios.post(`${API_URL}/auth/refresh-token`, {
                refreshToken
            });
        } catch (error) {
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Chuyển người dùng về trang login
        window.location.href = '/login';
    }

    setTokens(accessToken, refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    isAuthenticated() {
        return !!this.getAccessToken();
    }
}

const authService = new AuthService();
export default authService;