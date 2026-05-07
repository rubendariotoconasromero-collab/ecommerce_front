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
            // Si el usuario es null al recargar, esto da false. 
            // Por eso debemos cargar al usuario antes de evaluar esto en el router.
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
                this.user = response.data; // Aquí se recupera el usuario con sus roles al dar F5
            } catch (error) {
                this.token = null;
                localStorage.removeItem('access_token');
                throw error; // Lanzamos el error para que el router lo atrape
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