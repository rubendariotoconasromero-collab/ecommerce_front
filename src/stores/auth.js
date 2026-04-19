import { defineStore } from 'pinia';
import api from '../plugins/axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('access_token') || null,
    }),
    
    getters: {
        isAuthenticated: (state) => !!state.token,
        hasPermission: (state) => (permissionSlug) => {
            if (!state.user || !state.user.roles) return false;
            return state.user.roles.some(role => 
                role.permissions.some(perm => perm.slug === permissionSlug)
            );
        }
    },

    actions: {
        async login(credentials) {
            const response = await api.post('/login', credentials);
            
            this.token = response.data.access_token;
            localStorage.setItem('access_token', this.token);
            this.user = response.data.user;
        },

        async fetchUser() {
            try {
                const response = await api.get('/me');
                this.user = response.data;
            } catch (error) {
                this.token = null;
                localStorage.removeItem('access_token');
            }
        },

        async logout() {
            try {
                await api.post('/logout');
            } finally {
                this.user = null;
                this.token = null;
                localStorage.removeItem('access_token');
            }
        }
    }
});