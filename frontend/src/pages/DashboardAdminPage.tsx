import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// URL BASE + /api para datos
const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/api`;

const DashboardAdminPage: React.FC = () => {
  const [resumen, setResumen] = useState({ total_vehiculos: 0, total_accesos: 0, total_alertas: 0 });
  const [ocupacion, setOcupacion] = useState({ global: { pct: 0, ocupados: 0, total: 0 }, motos: { disp: 0 }, carros: { disp: 0 } });
  const [accesos, setAccesos] = useState([]);
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
      setAccesos(resAcceso.data.slice(0, 5)); 
      setOcupacion(resOcupacion.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

  return (
    <div className="container-fluid p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Control</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm col-span-2">
                <h3 className="font-bold text-gray-700">Ocupación: {ocupacion.global.pct}%</h3>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div className={`h-4 rounded-full ${ocupacion.global.pct > 90 ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${ocupacion.global.pct}%` }}></div>
                </div>
            </div>
            <div className="bg-red-600 text-white p-6 rounded-2xl text-center shadow-md">
                <h3 className="font-bold">Alertas</h3>
                <span className="text-5xl font-extrabold">{resumen.total_alertas}</span>
                <Link to="/admin/alertas" className="block mt-2 text-xs bg-white text-red-600 px-2 py-1 rounded-full w-fit mx-auto">VER</Link>
            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-bold text-gray-700 mb-4">Últimos Accesos</h3>
            <table className="w-full text-sm"><tbody>
                {accesos.map((acc: any, i) => (
                    <tr key={i} className="border-b"><td className="py-2 fw-bold">{acc.placa}</td><td className="py-2">{acc.resultado}</td><td className="py-2 text-right text-gray-500">{acc.fecha}</td></tr>
                ))}
            </tbody></table>
        </div>
    </div>
  );
};
export default DashboardAdminPage;