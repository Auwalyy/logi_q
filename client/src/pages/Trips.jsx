import { useState } from 'react';
import { Plus, Loader2, Send, Clock, CheckCircle } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import api from '../lib/api';

function CreateTripModal({ open, onClose, onCreated }) {
  const { data: drivers } = useFetch('/drivers');
  const { data: vehicles } = useFetch('/vehicles');
  const [form, setForm] = useState({
    origin: '', destination: '', route: '', type: 'passenger',
    scheduledDeparture: '', passengerCount: 0, cargoWeight: 0,
    driver: '', vehicle: '',
  });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/trips', form);
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule New Trip">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Origin</label>
            <input className="input" placeholder="Kano" value={form.origin} onChange={f('origin')} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Destination</label>
            <input className="input" placeholder="Lagos" value={form.destination} onChange={f('destination')} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Driver</label>
            <select className="input" value={form.driver} onChange={f('driver')} required>
              <option value="">Select driver</option>
              {drivers?.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Vehicle</label>
            <select className="input" value={form.vehicle} onChange={f('vehicle')}>
              <option value="">Select vehicle</option>
              {vehicles?.map(v => <option key={v._id} value={v._id}>{v.plateNumber} ({v.type})</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Type</label>
            <select className="input" value={form.type} onChange={f('type')}>
              <option value="passenger">Passenger</option>
              <option value="cargo">Cargo</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Scheduled Departure</label>
            <input className="input" type="datetime-local" value={form.scheduledDeparture} onChange={f('scheduledDeparture')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Passengers</label>
            <input className="input" type="number" value={form.passengerCount} onChange={f('passengerCount')} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Cargo (tonnes)</label>
            <input className="input" type="number" value={form.cargoWeight} onChange={f('cargoWeight')} />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          Schedule Trip
        </button>
      </form>
    </Modal>
  );
}

export default function Trips() {
  const { data: trips, loading, refetch } = useFetch('/trips');
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = trips?.filter(t => filter === 'all' || t.status === filter) ?? [];

  const depart = async (id) => {
    try { await api.put(`/trips/${id}/depart`); refetch(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const delay = async (id) => {
    const mins = prompt('Delay in minutes?');
    if (!mins) return;
    try { await api.put(`/trips/${id}/delay`, { delayMinutes: parseInt(mins) }); refetch(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner size="lg" />;

  const statuses = ['all', 'scheduled', 'loading', 'departed', 'arrived', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trips</h1>
          <p className="text-gray-500 text-sm mt-0.5">{trips?.length ?? 0} total trips</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Schedule Trip
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Trips table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Route', 'Driver', 'Vehicle', 'Type', 'Scheduled', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t._id} className="table-row">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{t.origin} → {t.destination}</p>
                    {t.delayMinutes > 0 && (
                      <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {t.delayMinutes}min delay
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{t.driver?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{t.vehicle?.plateNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md capitalize">{t.type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {t.scheduledDeparture ? new Date(t.scheduledDeparture).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3"><Badge status={t.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {t.status === 'scheduled' && (
                        <>
                          <button onClick={() => depart(t._id)} className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                            <CheckCircle size={11} /> Depart
                          </button>
                          <button onClick={() => delay(t._id)} className="text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                            <Clock size={11} /> Delay
                          </button>
                        </>
                      )}
                      {t.status === 'departed' && (
                        <button onClick={async () => { await api.put(`/trips/${t._id}/arrive`); refetch(); }} className="text-xs bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                          <Send size={11} /> Arrived
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-10">No trips found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTripModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={refetch} />
    </div>
  );
}
