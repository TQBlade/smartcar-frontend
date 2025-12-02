import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import CustomTable from '../components/CustomTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import ModalForm from '../components/ModalForm.jsx';

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/api`;

const VigilanteForm = ({ formData, handleChange }) => (
  <div className="row g-3">
    <div className="col-12 fw-bold text-primary">Datos Personales</div>
    <div className="col-6"><label>Nombre</label><input className="form-control" name="nombre" value={formData.nombre||''} onChange={handleChange} required/></div>
    <div className="col-6"><label>Documento</label><input className="form-control" name="doc_identidad" value={formData.doc_identidad||''} onChange={handleChange} required/></div>
    <div className="col-6"><label>Teléfono</label><input className="form-control" name="telefono" value={formData.telefono||''} onChange={handleChange} required/></div>
    <div className="col-6"><label>Rol</label><select className="form-select" name="id_rol" value={formData.id_rol||''} onChange={handleChange} required><option value="1">ADMINISTRADOR</option><option value="2">VIGILANTE</option></select></div>
    <div className="col-12 fw-bold text-danger mt-3">Credenciales</div>
    <div className="col-6"><label>Usuario</label><input className="form-control" name="usuario" value={formData.usuario||''} onChange={handleChange} required/></div>
    <div className="col-6"><label>Clave</label><input className="form-control" type="password" name="clave" value={formData.clave||''} onChange={handleChange}/></div>
  </div>
);

const VigilantesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try { setData((await axios.get(`${API_URL}/admin/vigilantes`, { headers })).data); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
        if(editId) await axios.put(`${API_URL}/admin/vigilantes/${editId}`, form, { headers });
        else await axios.post(`${API_URL}/admin/registrar_vigilante`, form, { headers });
        setIsOpen(false); fetchData(); Swal.fire('Éxito', 'Guardado', 'success');
    } catch(e) { Swal.fire('Error', 'No se pudo guardar', 'error'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (row) => {
    if((await Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true })).isConfirmed) {
        setIsSaving(true);
        try { await axios.delete(`${API_URL}/admin/vigilantes/${row.id_vigilante}`, { headers }); fetchData(); Swal.fire('Eliminado', '', 'success'); }
        catch { Swal.fire('Error', '', 'error'); } finally { setIsSaving(false); }
    }
  };

  const cols = useMemo(() => [{Header:'Nombre', accessor:'nombre'}, {Header:'Rol', accessor:'nombre_rol'}, {Header:'Usuario', accessor:'usuario'}], []);

  return (
    <div className="p-4 container-fluid">
        <LoadingOverlay isLoading={isSaving} />
        <div className="d-flex justify-content-between mb-4"><h2 className="fw-bold">Usuarios</h2><button className="btn btn-success fw-bold" onClick={()=>{setEditId(null); setForm({}); setIsOpen(true)}}>Nuevo</button></div>
        {loading ? 'Cargando...' : <div className="card border-0 shadow"><div className="card-body p-0"><CustomTable columns={cols} data={data} onEdit={(r)=>{setEditId(r.id_vigilante); setForm(r); setIsOpen(true)}} onDelete={handleDelete} /></div></div>}
        <ModalForm isOpen={isOpen} onClose={()=>setIsOpen(false)} title={editId?"Editar":"Nuevo"} onSubmit={handleSubmit}><VigilanteForm formData={form} handleChange={(e)=>setForm({...form, [e.target.name]:e.target.value})} /></ModalForm>
    </div>
  );
};
export default VigilantesPage;