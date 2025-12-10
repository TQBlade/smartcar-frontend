import { useCallback, useEffect, useState } from 'react';
// CORRECCIÓN AQUÍ: Agregamos 'Views' a la importación
import axios from 'axios';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api';

const CalendarioVigilante = () => {
  const navigate = useNavigate();
  
  // CORRECCIÓN: Ahora 'Views' sí existe
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
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

  // Manejadores de navegación (para que los botones funcionen)
  const handleNavigate = (newDate) => setCurrentDate(newDate);
  const handleViewChange = (newView) => setCurrentView(newView);

  const handleSelectEvent = (event) => setSelectedEvent(event);

  const checkPicoPlaca = async (e) => {
      e.preventDefault();
      if(!placaCheck) return;
      try {
          const res = await axios.get(`${API_URL}/pico-placa/${placaCheck}`);
          setPicoInfo(res.data);
      } catch (error) { 
        setPicoInfo({restriccion: false, mensaje: "Verifique manualmente."});
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
        
        <div className="bg-white border-end p-4 d-flex flex-column gap-4" style={{ width: '320px', minWidth: '320px' }}>
            <div className="card shadow-sm border-0 bg-danger text-white">
                <div className="card-body">
                    <h6 className="fw-bold border-bottom border-white pb-2 mb-3">
                        <i className="fas fa-car-side me-2"></i>Pico y Placa Cúcuta
                    </h6>
                    <form onSubmit={checkPicoPlaca}>
                        <div className="input-group mb-3">
                            <input type="text" className="form-control text-uppercase fw-bold text-center border-0 text-danger" placeholder="ABC-123" value={placaCheck} onChange={e=>setPlacaCheck(e.target.value.toUpperCase())} maxLength={6} />
                            <button className="btn btn-light fw-bold text-danger" type="submit">OK</button>
                        </div>
                    </form>
                    {picoInfo ? (
                        <div className={`rounded p-2 text-center fw-bold text-small ${picoInfo.restriccion ? 'bg-white text-danger' : 'bg-success text-white'}`}>
                            {picoInfo.restriccion ? '🚫 RESTRICCIÓN' : '✅ HABILITADO'}
                            <div className="small fw-normal mt-1">{picoInfo.mensaje}</div>
                        </div>
                    ) : (
                        <div className="small opacity-75 text-center">Lun(1-2), Mar(3-4), Mié(5-6), Jue(7-8), Vie(9-0)</div>
                    )}
                </div>
            </div>
            <div className="flex-grow-1 overflow-auto">
                <h6 className="text-secondary fw-bold small mb-3 text-uppercase">Próximos Eventos</h6>
                {events.length === 0 ? <p className="text-muted small italic">Agenda libre.</p> : (
                    events.filter(e => e.start >= new Date()).slice(0, 5).map(e => (
                        <div key={e.id_evento} className="card mb-2 border-0 shadow-sm border-start-4 border-start-danger cursor-pointer hover-shadow" onClick={() => setSelectedEvent(e)}>
                            <div className="card-body p-2">
                                <div className="fw-bold text-dark small">{e.title}</div>
                                <div className="text-muted text-xs">{e.start.toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="flex-grow-1 p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                date={currentDate}
                view={currentView}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                messages={{ next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día", agenda: "Agenda" }}
                culture='es'
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event) => {
                    let bg = '#0d6efd';
                    if (event.categoria === 'Mantenimiento') bg = '#dc3545';
                    return { style: { backgroundColor: bg } };
                }}
            />
        </div>
      </div>

      {selectedEvent && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">{selectedEvent.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEvent(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p><strong>Inicio:</strong> {selectedEvent.start.toLocaleString()}</p>
                <p><strong>Fin:</strong> {selectedEvent.end.toLocaleString()}</p>
                <p><strong>Ubicación:</strong> {selectedEvent.ubicacion}</p>
                <p><strong>Detalle:</strong> {selectedEvent.descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CalendarioVigilante;