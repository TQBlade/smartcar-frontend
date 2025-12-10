import { useCallback, useEffect, useState } from 'react';
// 👇 OJO: AQUÍ ESTABA EL ERROR, FALTABA 'Views'
import axios from 'axios';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// URL dinámica
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api';

const CalendarioVigilante = () => {
  const navigate = useNavigate();
  
  // Estados de Navegación (FIX BOTONES)
  const [currentDate, setCurrentDate] = useState(new Date());
  // 👇 AQUÍ SE USA Views. SI NO LO IMPORTAS ARRIBA, LA PANTALLA SE PONE BLANCA
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Pico y Placa
  const [placaCheck, setPlacaCheck] = useState('');
  const [picoInfo, setPicoInfo] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/eventos`, { headers: { Authorization: `Bearer ${token}` } });
      const parsedEvents = response.data.map(evt => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
        title: evt.titulo
      }));
      setEvents(parsedEvents);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSelectEvent = (event) => setSelectedEvent(event);

  // Manejadores para los botones
  const handleNavigate = (newDate) => setCurrentDate(newDate);
  const handleViewChange = (newView) => setCurrentView(newView);

  // Consulta Pico y Placa
  const checkPicoPlaca = async (e) => {
      e.preventDefault();
      if(!placaCheck) return;
      try {
          const res = await axios.get(`${API_URL}/pico-placa/${placaCheck}`);
          setPicoInfo(res.data);
      } catch (error) { 
        setPicoInfo({restriccion: false, mensaje: "Verifique manualmente la placa."});
      }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <style>{`
        .rbc-toolbar button.rbc-active { background-color: #b91c1c !important; color: white !important; border-color: #b91c1c !important; }
        .rbc-toolbar button:hover { background-color: #fcebeb; color: #b91c1c; }
      `}</style>

      <div className="bg-white shadow-sm border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
        <h1 className="h4 mb-0 fw-bold text-dark">Agenda Operativa</h1>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/vigilante/gestion')}>Volver</button>
      </div>

      <div className="flex-grow-1 d-flex bg-light">
        
        {/* SIDEBAR VIGILANTE */}
        <div className="bg-white border-end p-4 d-flex flex-column gap-4" style={{ width: '320px', minWidth: '320px' }}>
            
            {/* WIDGET PICO Y PLACA CÚCUTA */}
            <div className="card shadow-sm border-0 bg-danger text-white">
                <div className="card-body">
                    <h6 className="fw-bold border-bottom border-white pb-2 mb-3">
                        <i className="fas fa-car-side me-2"></i>Pico y Placa Cúcuta
                    </h6>
                    <form onSubmit={checkPicoPlaca}>
                        <div className="input-group mb-3">
                            <input 
                                type="text" 
                                className="form-control text-uppercase fw-bold text-center border-0 text-danger" 
                                placeholder="ABC-123" 
                                value={placaCheck} 
                                onChange={e=>setPlacaCheck(e.target.value.toUpperCase())} 
                                maxLength={6} 
                            />
                            <button className="btn btn-light fw-bold text-danger" type="submit">OK</button>
                        </div>
                    </form>
                    
                    {picoInfo ? (
                        <div className={`rounded p-2 text-center fw-bold text-small ${picoInfo.restriccion ? 'bg-white text-danger' : 'bg-success text-white'}`}>
                            {picoInfo.restriccion ? '🚫 RESTRICCIÓN' : '✅ HABILITADO'}
                            <div className="small fw-normal mt-1">{picoInfo.mensaje}</div>
                        </div>
                    ) : (
                        <div className="small opacity-75 text-center">
                            Lun(1-2), Mar(3-4), Mié(5-6), Jue(7-8), Vie(9-0)
                        </div>
                    )}
                </div>
            </div>

            {/* EVENTOS PRÓXIMOS */}
            <div className="flex-grow-1 overflow-auto">
                <h6 className="text-secondary fw-bold small mb-3 text-uppercase">Próximos Eventos</h6>
                {events.length === 0 ? <p className="text-muted small italic">Agenda libre.</p> : (
                    events
                    .filter(e => e.start >= new Date())
                    .sort((a,b) => a.start - b.start)
                    .slice(0, 5)
                    .map(e => (
                        <div key={e.id_evento} className="card mb-2 border-0 shadow-sm border-start-4 border-start-danger cursor-pointer hover-shadow" onClick={() => setSelectedEvent(e)}>
                            <div className="card-body p-2">
                                <div className="fw-bold text-dark small">{e.title}</div>
                                <div className="d-flex justify-content-between mt-1">
                                    <span className="text-muted" style={{fontSize: '0.75rem'}}>
                                        {e.start.toLocaleDateString()}
                                    </span>
                                    <span className="badge bg-light text-dark border">{e.categoria}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* CALENDARIO */}
        <div className="flex-grow-1 p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                
                // --- BOTONES FUNCIONALES ---
                date={currentDate}
                view={currentView}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                // ---------------------------

                messages={{ next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día", agenda: "Agenda" }}
                culture='es'
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event) => {
                    let bg = '#0d6efd';
                    if (event.categoria === 'Mantenimiento') bg = '#dc3545';
                    if (event.categoria === 'Evento Masivo') bg = '#fd7e14'; 
                    return { style: { backgroundColor: bg, color: event.categoria==='Evento Masivo'?'black':'white' } };
                }}
            />
        </div>
      </div>

      {/* MODAL DETALLE */}
      {selectedEvent && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">{selectedEvent.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEvent(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                    <div className="col-6">
                        <label className="small fw-bold text-muted">INICIO</label>
                        <div className="fs-6">{selectedEvent.start.toLocaleString()}</div>
                    </div>
                    <div className="col-6">
                        <label className="small fw-bold text-muted">FIN</label>
                        <div className="fs-6">{selectedEvent.end.toLocaleString()}</div>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="small fw-bold text-muted">UBICACIÓN</label>
                    <div>{selectedEvent.ubicacion || 'General'}</div>
                </div>
                <div className="bg-light p-3 rounded">
                    <p className="mb-0 fst-italic">"{selectedEvent.descripcion}"</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary w-100" onClick={() => setSelectedEvent(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioVigilante;