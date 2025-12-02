import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './DashboardVigilantePage.module.css'; // Tu CSS original

// URL NUBE
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const API_URL = `${BASE_URL}/api`;

const DashboardVigilantePage: React.FC = () => {
  const [ocupacion, setOcupacion] = useState({ motos: { disp: 0 }, carros: { disp: 0 } });
  const [ultimos, setUltimos] = useState<any[]>([]);
  const [placaBusqueda, setPlacaBusqueda] = useState('');

  const cargarDatos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resOcup, resAccess] = await Promise.all([
        axios.get(`${API_URL}/ocupacion`, config),
        axios.get(`${API_URL}/ultimos_accesos`, config)
      ]);

      setOcupacion(resOcup.data);
      setUltimos(resAccess.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  const buscarPlaca = async () => {
    if (!placaBusqueda) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/buscar_placa/${placaBusqueda}`, { headers: { Authorization: `Bearer ${token}` } });
      
      Swal.fire({
          title: '✅ Encontrado',
          html: `<p>Placa: <b>${res.data.placa}</b></p><p>Propietario: ${res.data.propietario}</p><p>Tipo: ${res.data.tipo}</p>`,
          icon: 'success',
          confirmButtonColor: '#b91c1c'
      });
      setPlacaBusqueda('');
    } catch {
      Swal.fire({ title: '❌ No existe', text: 'El vehículo no está registrado.', icon: 'error', confirmButtonColor: '#b91c1c' });
    }
  };

  return (
    <main className={styles.mainContent}> 
        {/* VALIDAR ACCESO MANUAL */}
        <section className={`${styles.tarjeta} ${styles.rojo}`}>
          <h2>Validar acceso vehicular</h2>
          <input 
            type="text" 
            placeholder="Buscar placa..." 
            value={placaBusqueda}
            onChange={(e) => setPlacaBusqueda(e.target.value.toUpperCase())}
            className="form-control mb-2"
          />
          <button onClick={buscarPlaca} className="btn btn-danger w-100">Verificar</button>
        </section>

        {/* HISTORIAL */}
        <section className={styles.tarjeta}>
          <h2>Historial de Accesos</h2>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Placa</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {ultimos.map((a, index) => (
                <tr key={index}>
                  <td>{a.fecha_hora}</td>
                  <td>{a.placa}</td>
                  <td>{a.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* CUPOS DISPONIBLES */}
        <section className={`${styles.tarjeta} ${styles.alerta}`}>
          <h2>Cupos Disponibles</h2>
          <div className="d-flex justify-content-around mt-3">
             <div className="text-center">
                 <h3 className="text-primary font-bold">{ocupacion.carros.disp}</h3>
                 <small>CARROS</small>
             </div>
             <div className="text-center">
                 <h3 className="text-warning font-bold">{ocupacion.motos.disp}</h3>
                 <small>MOTOS</small>
             </div>
          </div>
        </section>

        {/* GESTIÓN */}
        <section className={styles.tarjeta}>
          <h2>Acciones</h2>
          <Link to="/vigilante/vehiculos" className="btn btn-outline-primary w-100 mb-2">Gestión Vehículos</Link>
          <Link to="/vigilante/reportes" className="btn btn-outline-danger w-100">Reportar Novedad</Link>
        </section>
      </main>
  );
};

export default DashboardVigilantePage;