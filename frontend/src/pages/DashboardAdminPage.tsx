import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardVigilantePage.module.css'; // Usando tus estilos originales

// URL NUBE
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const API_URL = `${BASE_URL}/api`;

const DashboardAdminPage: React.FC = () => {
  const [resumen, setResumen] = useState({ total_vehiculos: 0, total_accesos: 0, total_alertas: 0 });
  const [accesos, setAccesos] = useState([]);
  const [ocupacion, setOcupacion] = useState({ global: { pct: 0, ocupados: 0, total: 0 } });
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resResumen, resAcceso, resOcupacion] = await Promise.all([
        axios.get(`${API_URL}/admin/resumen`, config),
        axios.get(`${API_URL}/admin/accesos`, config),
        axios.get(`${API_URL}/ocupacion`, config)
      ]);

      setResumen(resResumen.data);
      setAccesos(resAcceso.data);
      setOcupacion(resOcupacion.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  if (loading) return <div className={styles.mainContent}><p>Cargando datos...</p></div>;

  return (
    <div className={styles.mainContent}> 
        
        {/* RESUMEN GENERAL */}
        <section className={`${styles.tarjeta} p-4`}>
          <h2 className="text-xl font-bold mb-3 text-gray-700">Resumen General</h2>
          <div className="d-flex justify-content-between text-center">
              <div>
                  <p className="text-2xl font-bold">{resumen.total_vehiculos}</p>
                  <span>Vehículos</span>
              </div>
              <div>
                  <p className="text-2xl font-bold">{resumen.total_accesos}</p>
                  <span>Accesos</span>
              </div>
              <div>
                  <p className="text-2xl font-bold text-red-600">{resumen.total_alertas}</p>
                  <span>Alertas</span>
              </div>
          </div>
        </section>

        {/* OCUPACIÓN */}
        <section className={`${styles.tarjeta} ${styles.alerta} p-4`}>
          <h2 className="text-xl font-bold mb-3">Ocupación Parqueadero</h2>
          <p className="text-lg">Total: <b>{ocupacion.global.ocupados} / {ocupacion.global.total}</b></p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
             <div className={`h-4 rounded-full ${ocupacion.global.pct > 90 ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${ocupacion.global.pct}%` }}></div>
          </div>
          <p className="text-center font-bold mt-1">{ocupacion.global.pct}% Ocupado</p>
        </section>

        {/* HISTORIAL COMPLETO (Como pediste, no solo 5) */}
        <section className={`${styles.tarjeta} col-span-2 p-4`}>
          <h2 className="text-xl font-bold mb-4 text-gray-700">Historial de Accesos</h2>
          <div className="overflow-x-auto">
          <table className="table table-striped table-sm">
            <thead className="table-light">
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Propietario</th>
                <th>Resultado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {accesos.slice(0, 10).map((a: any, index) => (
                <tr key={index}>
                  <td>{a.placa}</td>
                  <td>{a.tipo}</td>
                  <td>{a.propietario}</td>
                  <td>{a.resultado}</td>
                  <td>{a.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <Link to="/admin/historial" className="btn btn-link float-end">Ver Todos</Link>
        </section>
    </div>
  );
};

export default DashboardAdminPage;