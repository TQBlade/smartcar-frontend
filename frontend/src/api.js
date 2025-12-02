// frontend/src/api.js
import axios from 'axios';

// 1. Definir la URL Base
// Si estamos en Vercel, import.meta.env.VITE_API_URL tendrá valor.
// Si estamos en local, será undefined y usará localhost.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

console.log("🌍 Conectando a:", BASE_URL); // Para depurar en consola

// 2. Crear una instancia de Axios
// Esto configura automáticamente la URL para todas las peticiones
const api = axios.create({
    baseURL: BASE_URL, 
    headers: {
        'Content-Type': 'application/json'
    }
});

// 3. Interceptor para agregar el Token automáticamente (Opcional pero recomendado)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;