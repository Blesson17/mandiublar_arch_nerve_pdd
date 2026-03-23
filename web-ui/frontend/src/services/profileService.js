import { httpClient } from './httpClient';

export const profileService = {
    getProfile() {
        return httpClient.get('/user');
    },
    updateProfile(payload) {
        return httpClient.put('/user', payload);
    }
};
