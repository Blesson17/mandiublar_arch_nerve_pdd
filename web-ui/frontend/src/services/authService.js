import { httpClient } from './httpClient';
import { authStore } from './authStore';

export const authService = {
    health() {
        return httpClient.get('/health');
    },
    async login(email, password) {
        const result = await httpClient.post('/login', { email, password });
        authStore.setSession({ token: result.token, userName: result.user?.name });
        return result;
    },
    async register(payload) {
        const result = await httpClient.post('/register', payload);
        authStore.setSession({ token: result.token, userName: result.user?.name });
        return result;
    },
    logout() {
        authStore.clearSession();
    }
};
