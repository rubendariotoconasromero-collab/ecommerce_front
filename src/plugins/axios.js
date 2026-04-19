import axios from 'axios';

const api = axios.create({
    // Apunta al servidor de Laravel (Asegúrate de que el puerto coincida con tu backend)
    baseURL: 'http://localhost:8000/api', 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Interceptor de Peticiones: Adjunta el Token automáticamente
api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de Respuestas: Manejo de errores globales (ej. Token expirado)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Si Laravel dice "No autorizado", borramos el token y mandamos al login
            localStorage.removeItem('access_token');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;