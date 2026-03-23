const TOKEN_KEY = 'implantAI_token';
const USER_NAME_KEY = 'implantAI_userName';

export const authStore = {
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },
    setSession({ token, userName }) {
        localStorage.setItem(TOKEN_KEY, token);
        if (userName) {
            localStorage.setItem(USER_NAME_KEY, userName);
        }
        window.dispatchEvent(new Event('storage'));
    },
    clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_NAME_KEY);
        window.dispatchEvent(new Event('storage'));
    },
    getUserName() {
        return localStorage.getItem(USER_NAME_KEY);
    },
    setUserName(userName) {
        localStorage.setItem(USER_NAME_KEY, userName);
        window.dispatchEvent(new Event('storage'));
    }
};
