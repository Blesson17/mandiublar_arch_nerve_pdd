import { httpClient } from './httpClient';

export const chatService = {
    send(message) {
        return httpClient.post('/chat', { message });
    }
};
