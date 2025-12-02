import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './LoginPage.module.css'; // Usando tu diseño original

// LÓGICA NUBE (Detecta si es Vercel o Localhost)
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

        if (!rol) {
            Swal.fire({ title: 'Atención', text: 'Seleccione un rol.', icon: 'warning', confirmButtonColor: '#b91c1c' });
            setLoading(false);
            return;
        }

        try {
            // Petición a la NUBE
            const response = await axios.post(`${BASE_URL}/login`, { usuario, clave, rol });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user));

            Swal.fire({
                title: 'Bienvenido',
                text: 'Ingresando al sistema...',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            setTimeout(() => {
                navigate(rol === 'Administrador' ? '/admin/inicio' : '/vigilante/inicio');
            }, 1500);

        } catch (err: any) {
            console.error("Login Error:", err);
            Swal.fire({ title: 'Error', text: 'Credenciales incorrectas o error de conexión.', icon: 'error', confirmButtonColor: '#b91c1c' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginContainer}>
                <div className={styles.logo}>
                    {/* Asegúrate de que la imagen exista en public/img/logo.png */}
                    <img src="/img/logo.png" alt="SmartCar Logo" onError={(e) => e.currentTarget.style.display = 'none'} /> 
                </div>
                <h1>Bienvenido a SmartCar</h1>
                <p>Inicia sesión para continuar</p>

                <form id="loginForm" onSubmit={handleLoginSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="usuario">Usuario</label>
                        <input type="text" id="usuario" placeholder="Usuario" required value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="clave">Contraseña</label>
                        <input type="password" id="clave" placeholder="Contraseña" required value={clave} onChange={(e) => setClave(e.target.value)} />
                    </div>
                    <div className={styles.roles}>
                        <label><input type="radio" name="rol" value="Administrador" checked={rol === 'Administrador'} onChange={(e) => setRol(e.target.value)} /> Administrador</label>
                        <label><input type="radio" name="rol" value="Vigilante" checked={rol === 'Vigilante'} onChange={(e) => setRol(e.target.value)} /> Vigilante</label>
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