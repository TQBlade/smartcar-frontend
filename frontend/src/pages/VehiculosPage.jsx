import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import CustomTable from '../components/CustomTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import ModalForm from '../components/ModalForm.jsx';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api';
const getToken = () => localStorage.getItem('token');

const VehiculoForm = ({ formData, handleChange }) => (
  <div className="row g-3">
    <div className="col-md-6"><label className="fw-bold">Placa</label><input className="form-control text-uppercase" name="placa" value={formData.placa||''} onChange={handleChange} required placeholder="AAA123"/></div>
    <div className="col-md-6"><label className="fw-bold">ID Propietario</label><input type="number" className="form-control" name="id_persona" value={formData.id_persona||''} onChange={handleChange} required/></div>
    <div className="col-md-6"><label className="fw-bold">Tipo</label><select className="form-select" name="tipo" value={formData.tipo||''} onChange={handleChange}><option value="">Seleccione...</option><option value="Automovil">Automóvil</option><option value="Motocicleta">Motocicleta</option></select></div>
    <div className="col-md-6"><label className="fw-bold">Color</label><input className="form-control" name="color" value={formData.color||''} onChange={handleChange}/></div>
  </div>
);

const VehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  
  // --- PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // <--- CAMBIO: MOSTRAR 10 POR PÁGINA

  const fetchVehiculos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/vehiculos`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setVehiculos(res.data);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVehiculos(); }, [fetchVehiculos]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const payload = { ...formData, id_persona: parseInt(formData.id_persona), placa: formData.placa.toUpperCase() };
      
      if (editingId) await axios.put(`${API_URL}/vehiculos/${editingId}`, payload, { headers });
      else await axios.post(`${API_URL}/vehiculos`, payload, { headers });

      setIsModalOpen(false); fetchVehiculos();
      Swal.fire({ title: 'Guardado', icon: 'success', confirmButtonColor: '#b91c1c' });
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.response?.data?.error || 'Falló la operación.', icon: 'error', confirmButtonColor: '#b91c1c' });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (vehiculo) => {
    const res = await Swal.fire({
        title: `¿Eliminar ${vehiculo.placa}?`,
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', confirmButtonText: 'Sí, eliminar'
    });
    if (res.isConfirmed) {
        setIsSaving(true);
        try {
            await axios.delete(`${API_URL}/vehiculos/${vehiculo.id_vehiculo}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchVehiculos();
            Swal.fire({ title: 'Eliminado', icon: 'success', confirmButtonColor: '#b91c1c' });
        } catch { Swal.fire({ title: 'Error', icon: 'error', confirmButtonColor: '#b91c1c' }); }
        finally { setIsSaving(false); }
    }
  };

  const handleOpen = (v) => { setEditingId(v?.id_vehiculo); setFormData(v || {}); setIsModalOpen(true); };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN INVERTIDA ---
  const filtered = vehiculos.filter(v => v.placa.toLowerCase().includes(searchTerm.toLowerCase()));
  const reversed = [...filtered].reverse(); // Los últimos creados primero

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reversed.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reversed.length / itemsPerPage);

  const columns = useMemo(() => [
    { Header: 'Placa', accessor: 'placa', Cell: ({value}) => <span className="fw-bold text-dark">{value}</span> },
    { Header: 'Tipo', accessor: 'tipo' },
    { Header: 'Color', accessor: 'color' },
    { Header: 'Propietario', accessor: 'propietario.nombre' },
  ], []);

  return (
    <div className="container-fluid p-4">
        <LoadingOverlay isLoading={isSaving} message="Guardando..." />
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h1 className="h2 text-gray-800 fw-bold">Gestión de Vehículos</h1>
            <button className="btn btn-primary fw-bold" onClick={() => handleOpen(null)}><i className="fas fa-car me-2"></i> Agregar</button>
        </div>
        
        <input 
            className="form-control mb-3" 
            placeholder="Buscar placa..." 
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
        />
        
        {loading ? <div className="text-center p-5"><div className="spinner-border text-primary"></div></div> : (
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <CustomTable columns={columns} data={currentItems} onEdit={handleOpen} onDelete={handleDelete} />
                </div>
                
                {/* CONTROLES DE PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                        <span className="text-muted small">Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, reversed.length)} de {reversed.length}</span>
                        <div className="btn-group">
                            <button 
                                className="btn btn-outline-secondary btn-sm" 
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                                disabled={currentPage === 1}
                            >
                                <i className="fas fa-chevron-left me-1"></i> Anterior
                            </button>
                            <button className="btn btn-outline-secondary btn-sm disabled fw-bold text-dark">
                                {currentPage} / {totalPages}
                            </button>
                            <button 
                                className="btn btn-outline-secondary btn-sm" 
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                                disabled={currentPage >= totalPages}
                            >
                                Siguiente <i className="fas fa-chevron-right ms-1"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
        <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar" : "Nuevo"} onSubmit={handleSubmit}><VehiculoForm formData={formData} handleChange={handleChange} /></ModalForm>
    </div>
  );
};
export default VehiculosPage;