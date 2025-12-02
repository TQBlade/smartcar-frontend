import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/api`;

const DashboardVigilantePage: React.FC = () => {
  const [ocupacion, setOcupacion] = useState({ motos: { disp: 0 }, carros: { disp: 0 } });
  const [ultimos, setUltimos] = useState<any[]>([]);
  const [placaBusqueda, setPlacaBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

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
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargarDatos(); const i = setInterval(cargarDatos, 15000); return () => clearInterval(i); }, [cargarDatos]);

  const buscarPlaca = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
        const res = await axios.get(`${API_URL}/buscar_placa/${placaBusqueda}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        Swal.fire({ title: '✅ Encontrado', text: `Placa: ${res.data.placa} | Propietario: ${res.data.propietario}`, icon: 'success', confirmButtonColor: '#b91c1c' });
        setPlacaBusqueda('');
    } catch { Swal.fire({ title: '❌ No Registrado', icon: 'error', confirmButtonColor: '#b91c1c' }); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-l-8 border-blue-600">
            <h1 className="text-2xl font-bold mb-4">Disponibilidad</h1>
            <div className="flex gap-8">
                <div><span className="text-3xl font-bold text-blue-700">{ocupacion.carros.disp}</span> <small>CARROS</small></div>
                <div><span className="text-3xl font-bold text-yellow-600">{ocupacion.motos.disp}</span> <small>MOTOS</small></div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <form onSubmit={buscarPlaca} className="flex gap-2"><input className="form-control text-uppercase font-bold text-center" value={placaBusqueda} onChange={e=>setPlacaBusqueda(e.target.value)} placeholder="ABC-123"/><button className="btn btn-primary">🔎</button></form>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/vigilante/historial" className="btn btn-outline-primary py-4 fw-bold">Validar Acceso</Link>
                    <Link to="/vigilante/reportes" className="btn btn-outline-warning py-4 fw-bold text-dark">Reportar</Link>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4">
                <h4 className="fw-bold border-b pb-2 mb-2">Tráfico Reciente</h4>
                {ultimos.map((u, i) => <div key={i} className="d-flex justify-content-between border-bottom py-2"><strong>{u.placa}</strong><span>{u.resultado}</span></div>)}
            </div>
        </div>
    </div>
  );
};
export default DashboardVigilantePage;