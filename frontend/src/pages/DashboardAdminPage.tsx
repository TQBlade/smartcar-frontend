import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// URL Dinámica para que funcione en Vercel y Localhost
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api';

const DashboardAdminPage: React.FC = () => {
  // Estado para el Resumen (KPIs)
  const [resumen, setResumen] = useState({ 
    total_vehiculos: 0, 
    total_accesos: 0, 
    total_alertas: 0 
  });

  // Estado para Ocupación (Inicializamos para evitar errores de renderizado)
  const [ocupacion, setOcupacion] = useState({ 
    global: { pct: 0, ocupados: 0, total: 1300 }, // Default 1300
    motos: { disp: 0, total: 1000 }, 
    carros: { disp: 0, total: 300 } 
  });

  // Estado para Accesos
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función de Carga
  const cargarDatos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Hacemos las peticiones en paralelo
      const [resResumen, resAcceso, resOcupacion] = await Promise.all([
        axios.get(`${API_URL}/admin/resumen`, config),
        axios.get(`${API_URL}/admin/accesos`, config),
        axios.get(`${API_URL}/ocupacion`, config) // Nota: sin /api extra, porque API_URL ya lo tiene
      ]);

      setResumen(resResumen.data);
      setAccesos(resAcceso.data.slice(0, 5)); // Solo los 5 últimos
      
      // Actualizamos ocupación si vienen datos válidos
      if (resOcupacion.data && resOcupacion.data.global) {
          setOcupacion(resOcupacion.data);
      }

    } catch (err) {
      console.error("❌ Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al inicio y cada 15 segundos
  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 15000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 font-bold">Conectando con el sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-6 bg-gray-50 min-h-screen">
        
        {/* TÍTULO */}
        <div className="mb-6 flex justify-between items-center border-b pb-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
                <p className="text-gray-500 text-sm">Resumen operativo y estado del sistema.</p>
            </div>
            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border">
                📅 {new Date().toLocaleDateString()}
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* 1. TARJETA DE OCUPACIÓN (Dinámica) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">Ocupación del Parqueadero</h3>
                    <Link to="/admin/vehiculos" className="text-sm font-bold text-blue-600 hover:underline">
                        Gestionar Vehículos →
                    </Link>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {ocupacion.global.ocupados} OCUPADOS
                        </span>
                        <span className={`font-bold ${ocupacion.global.pct > 90 ? 'text-red-600' : 'text-green-600'}`}>
                            {ocupacion.global.pct}% Lleno
                        </span>
                    </div>
                    {/* Barra de Progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                            className={`h-4 rounded-full transition-all duration-1000 ${ocupacion.global.pct > 90 ? 'bg-red-600' : ocupacion.global.pct > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                            style={{ width: `${ocupacion.global.pct}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0</span>
                        <span>Capacidad Total: {ocupacion.global.total}</span>
                    </div>
                </div>

                {/* Detalles Motos/Carros */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                        <p className="text-xs text-gray-500 font-bold uppercase">Carros Disp.</p>
                        <p className="text-xl font-bold text-blue-600">{ocupacion.carros.disp}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                        <p className="text-xs text-gray-500 font-bold uppercase">Motos Disp.</p>
                        <p className="text-xl font-bold text-yellow-600">{ocupacion.motos.disp}</p>
                    </div>
                </div>
            </div>

            {/* 2. TARJETA ALERTAS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-red-800">Alertas Activas</h3>
                        <i className="fas fa-bell text-red-500 text-xl"></i>
                    </div>
                    <div className="text-5xl font-extrabold text-red-600 my-3">
                        {resumen.total_alertas}
                    </div>
                    <p className="text-xs text-red-400">Incidentes sin resolver</p>
                </div>
                <Link to="/admin/alertas" className="mt-4 w-full py-2 bg-red-600 text-white text-center rounded-lg font-bold hover:bg-red-700 transition">
                    Ver Centro de Alertas
                </Link>
            </div>
        </div>

        {/* 3. TABLA DE ACCESOS RECIENTES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm uppercase">Últimos Accesos</h3>
                <Link to="/admin/historial" className="text-blue-600 font-bold text-xs hover:underline">VER HISTORIAL COMPLETO</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Placa</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Propietario</th>
                            <th className="px-6 py-3 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {accesos.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No hay registros recientes</td></tr>
                        ) : (
                            accesos.map((acc: any, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 text-gray-500">{acc.fecha}</td>
                                    <td className="px-6 py-3 font-bold text-gray-800">{acc.placa}</td>
                                    <td className="px-6 py-3 text-gray-500">{acc.tipo}</td>
                                    <td className="px-6 py-3 text-gray-600">{acc.propietario}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            acc.resultado.toLowerCase().includes('autorizado') || acc.resultado.toLowerCase().includes('concedido')
                                            ? 'text-green-700 bg-green-100' 
                                            : 'text-red-700 bg-red-100'
                                        }`}>
                                            {acc.resultado}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default DashboardAdminPage;