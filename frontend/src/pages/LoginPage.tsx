import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './LoginPage.module.css';

// URL de Producción (Render)
const BASE_URL = import.meta.env.VITE_API_URL; 

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [rol, setRol] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        if (token && userInfo.rol) {
            navigate(userInfo.rol === 'Administrador' ? '/admin/inicio' : '/vigilante/inicio');
        }
    }, [navigate]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!BASE_URL) {
            Swal.fire({ title: 'Error Config', text: 'Falta VITE_API_URL en Vercel', icon: 'error' });
            setLoading(false);
            return;
        }

        if (!rol) {
            Swal.fire({ title: 'Atención', text: 'Debe seleccionar un rol.', icon: 'warning', confirmButtonColor: '#b91c1c' });
            setLoading(false);
            return;
        }

        try {
            // LOGIN: POST a /login (sin /api)
            const response = await axios.post(`${BASE_URL}/login`, { usuario, clave, rol });

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
                navigate(rol === 'Administrador' ? '/admin/inicio' : '/vigilante/inicio');
            }, 1500);

        } catch (err: any) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.error || 'No se pudo conectar al servidor.';
            Swal.fire({ title: 'Error de Acceso', text: msg, icon: 'error', confirmButtonColor: '#b91c1c' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginContainer}>
                <h1>SmartCar</h1>
                <p>Control de Acceso Vehicular</p>
                <form id="loginForm" onSubmit={handleLoginSubmit}>
                    <div className={styles.formGroup}>
                        <label>Usuario</label>
                        <input type="text" placeholder="Correo" required value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Contraseña</label>
                        <input type="password" placeholder="Clave" required value={clave} onChange={(e) => setClave(e.target.value)} />
                    </div>
                    <div className={styles.roles}>
                        <label><input type="radio" name="rol" value="Administrador" checked={rol === 'Administrador'} onChange={(e) => setRol(e.target.value)} /> Admin</label>
                        <label><input type="radio" name="rol" value="Vigilante" checked={rol === 'Vigilante'} onChange={(e) => setRol(e.target.value)} /> Vigilante</label>
                    </div>
                    <button type="submit" id="btnLogin" disabled={loading}>{loading ? 'Conectando...' : 'Entrar'}</button>
                </form>
            </div>
        </div>
    );
};
export default LoginPage;