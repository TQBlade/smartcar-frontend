import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

// CONFIGURACIÓN DE URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const API_URL = `${BASE_URL}/api`;

// --- ICONOS SVG ---
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const CameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);

export default function Accesos() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistorial = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('placa', searchTerm);
      if (vehicleType) params.append('tipo', vehicleType);
      if (dateFrom) params.append('desde', dateFrom);
      if (dateTo) params.append('hasta', dateTo);

      const response = await axios.get(`${API_URL}/accesos?${params.toString()}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      setHistorial(response.data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, vehicleType, dateFrom, dateTo]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchHistorial(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchHistorial]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-800">Historial de Accesos</h1>
          <p className="text-gray-600">Visualiza y gestiona el ingreso vehicular.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-red-800 transition-all active:scale-95">
          <CameraIcon /> Validar Nuevo Acceso
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          <input type="text" placeholder="Ej: ABC-123" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 outline-none bg-white" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            <option value="">Tipo: Todos</option>
            <option value="Automovil">Automóvil</option>
            <option value="Motocicleta">Motocicleta</option>
            <option value="Camioneta">Camioneta</option>
          </select>
        </div>
        <div><input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 outline-none" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
        <div><input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 outline-none" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Placa</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Entrada</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Salida</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="6" className="text-center py-4">Cargando...</td></tr> : 
               historial.length === 0 ? <tr><td colSpan="6" className="text-center py-4 text-gray-500">No hay registros.</td></tr> :
               historial.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.placa}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.tipo}</td>
                    <td className="px-6 py-4 text-gray-500">{item.entrada}</td>
                    <td className="px-6 py-4 text-gray-500">{item.salida}</td>
                    <td className="px-6 py-4 text-gray-500">{item.fecha}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ (item.estado && (item.estado.includes('Concedido') || item.estado.includes('Autorizado'))) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>{item.estado}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-red-700 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2"><CameraIcon /> Validar Acceso</h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-red-600 rounded-full p-1 transition-colors"><XIcon /></button>
            </div>
            <div className="p-6">
              <ValidationComponentInternal 
                apiUrl={`${API_URL}/accesos/validar`} 
                onClose={() => setShowModal(false)} 
                onRefresh={fetchHistorial} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE OPTIMIZADO MODO SUPERVIVENCIA ---
function ValidationComponentInternal({ apiUrl, onClose, onRefresh }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accessType, setAccessType] = useState('entrada');

  // --- DIETA EXTREMA PARA LA IMAGEN ---
  const redimensionarImagen = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // 1. TAMAÑO MINIATURA (350px): Suficiente para placas, muy ligero
          const maxWidth = 350; 
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          
          // 2. ESCALA DE GRISES EN CLIENTE (Menos trabajo para el backend)
          ctx.filter = 'grayscale(100%) contrast(1.5)'; 
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // 3. COMPRESIÓN AGRESIVA (Calidad 0.5)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Guardamos versión optimizada
      const resizedBase64 = await redimensionarImagen(file);
      setPreviewUrl(resizedBase64);
      setBase64Image(resizedBase64);
    }
  };

  const handleValidate = async () => {
    if (!base64Image) return;
    setIsLoading(true);

    try {
      // Enviamos la imagen "a dieta"
      const response = await axios.post(apiUrl, {
        image_base64: base64Image,
        tipo_acceso: accessType
      });

      const data = response.data;

      if (data.resultado === 'Autorizado') {
        Swal.fire({
            title: '¡AUTORIZADO!',
            html: `<h2 style="color:green; font-weight:bold;">${data.datos.placa}</h2><p>${data.datos.propietario}</p>`,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
        });
        if(onRefresh) onRefresh();
        onClose();
      } else {
        Swal.fire({
            title: '¡DENEGADO!',
            html: `<h3 style="color:red;">${data.datos.placa || 'No leída'}</h3><p>${data.datos.motivo}</p>`,
            icon: 'error',
            confirmButtonColor: '#b91c1c'
        });
      }
    } catch (error) {
      console.error(error);
      const status = error.response ? error.response.status : 0;
      
      let msg = 'Error de conexión.';
      if (status === 502 || status === 500) {
          msg = '⚠️ Memoria llena en servidor gratuito. Intenta de nuevo en 10 segundos.';
      }

      Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonColor: '#b91c1c' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-lg">
        <button onClick={() => setAccessType('entrada')} className={`py-2 text-sm font-bold rounded-md transition-all ${accessType === 'entrada' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500'}`}>ENTRADA</button>
        <button onClick={() => setAccessType('salida')} className={`py-2 text-sm font-bold rounded-md transition-all ${accessType === 'salida' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500'}`}>SALIDA</button>
      </div>
      
      <div className="relative group">
        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-red-50 transition-all">
             <div className="p-4 bg-white rounded-full shadow-sm mb-3"><CameraIcon /></div>
             <span className="text-sm font-medium text-gray-600">Toca para subir foto</span>
             <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
          </label>
        ) : (
          <div className="relative h-48 rounded-xl overflow-hidden shadow-md">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover grayscale" />
            <button onClick={() => { setPreviewUrl(null); setBase64Image(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"><XIcon /></button>
          </div>
        )}
      </div>

      <button onClick={handleValidate} disabled={!previewUrl || isLoading} className={`w-full py-3.5 rounded-xl font-bold text-white flex justify-center items-center transition-all ${!previewUrl || isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}>
        {isLoading ? 'Procesando (Modo Ahorro)...' : `Validar ${accessType.toUpperCase()}`}
      </button>
    </div>
  );
}