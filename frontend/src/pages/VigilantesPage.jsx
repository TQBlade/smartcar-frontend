import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import CustomTable from '../components/CustomTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import ModalForm from '../components/ModalForm.jsx';

// URL NUBE
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const API_URL = `${BASE_URL}/api`;

// Formulario Completo como pediste
const VigilanteForm = ({ formData, handleChange }) => (
  <div className="row g-3">
    <div className="col-md-6">
      <label className="fw-bold">Nombre Completo</label>
      <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} required className="form-control" />
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Documento</label>
      <input type="text" name="doc_identidad" value={formData.doc_identidad || ''} onChange={handleChange} required className="form-control" />
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Teléfono</label>
      <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleChange} required className="form-control" />
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Rol Asignado</label>
      <select name="id_rol" value={formData.id_rol || ''} onChange={handleChange} required className="form-select">
        <option value="">Seleccione...</option>
        <option value="1">ADMINISTRADOR</option>
        <option value="2">VIGILANTE</option>
      </select>
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Usuario (Login)</label>
      <input type="text" name="usuario" value={formData.usuario || ''} onChange={handleChange} required className="form-control" />
    </div>
    <div className="col-md-6">
      <label className="fw-bold">Contraseña</label>
      <input type="password" name="clave" value={formData.clave || ''} onChange={handleChange} className="form-control" placeholder="Dejar vacío si no cambia" />
    </div>
  </div>
);

const VigilantesPage = () => {
  const [vigilantes, setVigilantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  
  const getToken = () => localStorage.getItem('token');

  const fetchVigilantes = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/vigilantes`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setVigilantes(response.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVigilantes(); }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      if (editingId) {
        await axios.put(`${API_URL}/admin/vigilantes/${editingId}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}/admin/registrar_vigilante`, formData, { headers });
      }
      
      setIsModalOpen(false);
      setFormData({});
      fetchVigilantes();
      Swal.fire('Éxito', 'Operación realizada correctamente', 'success');
    } catch (err) {
      Swal.fire('Error', 'No se pudo guardar el registro', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const res = await Swal.fire({
        title: `¿Eliminar a ${user.nombre}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33'
    });

    if (res.isConfirmed) {
        setIsSaving(true);
        try {
            await axios.delete(`${API_URL}/admin/vigilantes/${user.id_vigilante}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            fetchVigilantes();
            Swal.fire('Eliminado', '', 'success');
        } catch {
            Swal.fire('Error', '', 'error');
        } finally {
            setIsSaving(false);
        }
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOpenModal = (u) => { setEditingId(u?.id_vigilante); setFormData(u || {}); setIsModalOpen(true); };

  const columns = useMemo(() => [
    { Header: 'Nombre', accessor: 'nombre' },
    { Header: 'Documento', accessor: 'doc_identidad' },
    { Header: 'Rol', accessor: 'nombre_rol' },
    { Header: 'Usuario', accessor: 'usuario' }, // Volvemos a mostrar usuario
  ], []);

  return (
    <div className="container-fluid p-4">
        <LoadingOverlay isLoading={isSaving} message="Procesando..." />
        
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h2 text-gray-800">Gestión de Personal</h1>
            <button className="btn btn-primary" onClick={() => handleOpenModal(null)}>
                <i className="fas fa-plus me-2"></i> Nuevo
            </button>
        </div>

        {loading ? <p>Cargando...</p> : (
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <CustomTable columns={columns} data={vigilantes} onEdit={handleOpenModal} onDelete={handleDelete} />
                </div>
            </div>
        )}

        <ModalForm 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title={editingId ? "Editar Personal" : "Nuevo Personal"} 
            onSubmit={handleSubmit}
        >
            <VigilanteForm formData={formData} handleChange={handleChange} />
        </ModalForm>
    </div>
  );
};

export default VigilantesPage;