import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [rol, setRol] = useState('');
    const [loading, setLoading] = useState(false);

    // LÓGICA DE DEPURACIÓN SENIOR
    // 1. Leemos la variable.
    // 2. Si estamos en Vercel (window.location tiene 'vercel.app'), FORZAMOS la URL de Render si la variable falló.
    let BASE_URL = import.meta.env.VITE_API_URL;

    // Fallback de seguridad: Si estamos en la nube y la variable vino vacía, usar la de Render a la fuerza.
    if (!BASE_URL && window.location.hostname.includes('vercel.app')) {
        BASE_URL = 'https://smartcar-api.onrender.com';
        console.warn('⚠️ VITE_API_URL no detectada. Usando URL de respaldo hardcodeada.');
    } 
    // Si estamos en local, usar localhost
    else if (!BASE_URL) {
        BASE_URL = 'http://127.0.0.1:5000';
    }

    // Imprimir en consola para que veas qué está pasando
    console.log("🌍 CONECTANDO A:", BASE_URL);

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
            Swal.fire({ title: 'Falta Rol', text: 'Seleccione Administrador o Vigilante', icon: 'warning', confirmButtonColor: '#b91c1c' });
            setLoading(false);
            return;
        }

        try {
            // Petición directa
            console.log(`🚀 Enviando petición a: ${BASE_URL}/login`);
            
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
            console.error("❌ Error Login:", err);
            
            // Mensaje detallado si es error de red
            let msg = 'Error desconocido.';
            if (err.code === "ERR_NETWORK") {
                msg = `No se pudo conectar al servidor en: ${BASE_URL}. El servidor puede estar dormido (espera 1 min) o es un error de CORS.`;
            } else if (err.response?.data?.error) {
                msg = err.response.data.error;
            }

            Swal.fire({ title: 'Error de Acceso', text: msg, icon: 'error', confirmButtonColor: '#b91c1c' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginContainer}>
                <h1 style={{color: '#b91c1c', fontWeight: 'bold', marginBottom: '10px'}}>SmartCar</h1>
                <p>Sistema de Control de Acceso</p>

                <form id="loginForm" onSubmit={handleLoginSubmit}>
                    <div className={styles.formGroup}>
                        <label>Usuario</label>
                        <input type="text" placeholder="Ej: ADMIN@CARROS.COM" required value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Contraseña</label>
                        <input type="password" placeholder="•••••" required value={clave} onChange={(e) => setClave(e.target.value)} />
                    </div>
                    <div className={styles.roles}>
                        <label><input type="radio" name="rol" value="Administrador" checked={rol === 'Administrador'} onChange={(e) => setRol(e.target.value)} /> Admin</label>
                        <label><input type="radio" name="rol" value="Vigilante" checked={rol === 'Vigilante'} onChange={(e) => setRol(e.target.value)} /> Vigilante</label>
                    </div>
                    <button type="submit" id="btnLogin" disabled={loading} style={{backgroundColor: '#b91c1c'}}>
                        {loading ? 'Conectando...' : 'Iniciar Sesión'}
                    </button>
                </form>
                <small style={{display:'block', marginTop:'20px', color:'#999'}}>Backend: {BASE_URL}</small>
            </div>
        </div>
    );
};

export default LoginPage;