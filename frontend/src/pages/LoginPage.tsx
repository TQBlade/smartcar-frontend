import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Estilos del login
import styles from './LoginPage.module.css';

// --- CONFIGURACIÓN URL NUBE ---
let BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL && window.location.hostname.includes('vercel.app')) {
    BASE_URL = 'https://smartcar-api.onrender.com';
}
if (!BASE_URL) {
    BASE_URL = 'http://127.0.0.1:5000';
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [rol, setRol] = useState('');
    const [loading, setLoading] = useState(false);
    // Nota: Quitamos el estado 'alert' viejo porque ahora usas Swal

    // ============================================================
    // 🔐 VERIFICAR SI YA ESTÁ LOGUEADO
    // ============================================================
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');

        if (token && userInfo.rol) {
            if (userInfo.rol === 'Administrador') {
                navigate('/admin/inicio');
            } else if (userInfo.rol === 'Vigilante') {
                navigate('/vigilante/inicio');
            }
        }
    }, [navigate]);

    // ============================================================
    // 🔐 LOGIN SUBMIT
    // ============================================================
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!rol) {
            Swal.fire({ title: 'Atención', text: 'Debe seleccionar un rol.', icon: 'warning', confirmButtonColor: '#b91c1c' });
            setLoading(false);
            return;
        }

        try {
            // Usamos la URL dinámica + /login (sin /api)
            const response = await axios.post(`${BASE_URL}/login`, {
                usuario,
                clave,
                rol
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user));

            Swal.fire({
                title: '¡Bienvenido!',
                text: 'Iniciando sesión...',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            setTimeout(() => {
                if (rol === 'Administrador') {
                    navigate('/admin/inicio');
                } else {
                    navigate('/vigilante/inicio');
                }
            }, 1500);

        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error de conexión con el servidor.';
            Swal.fire({ title: 'Error', text: errorMessage, icon: 'error', confirmButtonColor: '#b91c1c' });
            setLoading(false);
        }
    };

    // ============================================================
    // 🎨 UI DEL LOGIN
    // ============================================================
    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginContainer}>
                <div className={styles.logo}>
                    <img src="/img/logo.png" alt="SmartCar Logo" />
                </div>

                <h1>Bienvenido a SmartCar</h1>
                <p>Inicia sesión para continuar</p>

                <form id="loginForm" onSubmit={handleLoginSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="usuario">Usuario</label>
                        <input
                            type="text"
                            id="usuario"
                            name="usuario"
                            placeholder="Ingresa tu usuario"
                            required
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="clave">Contraseña</label>
                        <input
                            type="password"
                            id="clave"
                            name="clave"
                            placeholder="Ingresa tu contraseña"
                            required
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                        />
                    </div>

                    <div className={styles.roles}>
                        <label>
                            <input
                                type="radio"
                                name="rol"
                                value="Administrador"
                                checked={rol === 'Administrador'}
                                onChange={(e) => setRol(e.target.value)}
                            /> Administrador
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="rol"
                                value="Vigilante"
                                checked={rol === 'Vigilante'}
                                onChange={(e) => setRol(e.target.value)}
                            /> Vigilante
                        </label>
                    </div>

                    <button type="submit" id="btnLogin" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;