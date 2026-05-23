import { useState } from 'react';
import { Plus, ChevronRight, Loader2, Users, Clock } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import api from '../lib/api';

function QueueTimeline({ entries }) {
  if (!entries?.length) return <p className="text-gray-500 text-sm text-center py-6">No vehicles in queue</p>;
  return (
    <div className="space-y-2 mt-4">
      {entries.filter(e => e.status !== 'cancelled').map((entry, i) => (
        <div key={entry._id} className="flex items-center gap-3">
          {/* Position bubble */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            entry.status === 'loading' ? 'bg-brand-600 text-white' :
            entry.status === 'departed' ? 'bg-gray-700 text-gray-400' :
            'bg-gray-800 text-gray-300'
          }`}>
            {entry.position}
          </div>
          {/* Connector */}
          <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{entry.driver?.name || 'Unknown Driver'}</p>
              <p className="text-xs text-gray-500">
                {entry.vehicle?.plateNumber || '—'} · {entry.destination || 'N/A'}
                {entry.passengerCount > 0 && ` · ${entry.passengerCount} pax`}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <Badge status={entry.status} />
              {entry.estimatedDepartureTime && (
                <p className="text-xs text-gray-500 mt-1">
                  ETA {new Date(entry.estimatedDepartureTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateQueueModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', route: '', park: '', type: 'mixed', maxCapacity: 50, avgLoadTimeMinutes: 30 });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/queues', form);
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create queue');
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Create New Queue">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Queue Name</label>
            <input className="input" placeholder="Kano North Queue" value={form.name} onChange={f('name')} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Route</label>
            <input className="input" placeholder="Kano → Lagos" value={form.route} onChange={f('route')} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Park / Hub</label>
            <input className="input" placeholder="Kano Central Park" value={form.park} onChange={f('park')} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Type</label>
            <select className="input" value={form.type} onChange={f('type')}>
              <option value="mixed">Mixed</option>
              <option value="passenger">Passenger</option>
              <option value="cargo">Cargo</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max Capacity</label>
            <input className="input" type="number" value={form.maxCapacity} onChange={f('maxCapacity')} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Avg Load Time (min)</label>
            <input className="input" type="number" value={form.avgLoadTimeMinutes} onChange={f('avgLoadTimeMinutes')} />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          Create Queue
        </button>
      </form>
    </Modal>
  );
}

export default function Queues() {
  const { data: queues, loading, refetch } = useFetch('/queues');
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const activeQueue = queues?.find(q => q._id === selected) || queues?.[0];

  const updateEntryStatus = async (queueId, entryId, action) => {
    try {
      await api.put(`/queues/${queueId}/entries/${entryId}/${action}`);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Queue Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{queues?.length ?? 0} active queues</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Queue
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue list */}
        <div className="space-y-3">
          {queues?.map(q => (
            <button
              key={q._id}
              onClick={() => setSelected(q._id)}
              className={`w-full text-left card transition-all ${activeQueue?._id === q._id ? 'border-brand-600/50 bg-brand-600/5' : 'hover:border-gray-700'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">{q.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{q.route}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{q.park}</p>
                </div>
                <ChevronRight size={16} className="text-gray-600 mt-0.5" />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Badge status={q.status} />
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Users size={11} />
                  {q.entries?.filter(e => ['waiting','loading'].includes(e.status)).length ?? 0} waiting
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={11} />
                  {q.avgLoadTimeMinutes}min avg
                </span>
              </div>
            </button>
          ))}
          {!queues?.length && (
            <div className="card text-center py-10">
              <p className="text-gray-500 text-sm">No queues yet</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary mt-3 text-sm">Create first queue</button>
            </div>
          )}
        </div>

        {/* Queue detail */}
        <div className="lg:col-span-2 card">
          {activeQueue ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-white text-lg">{activeQueue.name}</h2>
                  <p className="text-gray-500 text-sm">{activeQueue.route} · {activeQueue.park}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={activeQueue.status} />
                  <button onClick={refetch} className="btn-ghost text-xs px-3 py-1.5">Refresh</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'Waiting', value: activeQueue.entries?.filter(e => e.status === 'waiting').length ?? 0 },
                  { label: 'Loading', value: activeQueue.entries?.filter(e => e.status === 'loading').length ?? 0 },
                  { label: 'Departed', value: activeQueue.entries?.filter(e => e.status === 'departed').length ?? 0 },
                ].map(s => (
                  <div key={s.label} className="bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <QueueTimeline entries={activeQueue.entries} />

              {/* Action buttons for loading/departing */}
              {activeQueue.entries?.filter(e => e.status === 'waiting').length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-3">Quick Actions — Next in queue</p>
                  {(() => {
                    const next = activeQueue.entries.find(e => e.status === 'waiting');
                    if (!next) return null;
                    return (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateEntryStatus(activeQueue._id, next._id, 'load')}
                          className="btn-primary text-sm flex-1"
                        >
                          Start Loading #{next.position}
                        </button>
                        {activeQueue.entries.find(e => e.status === 'loading') && (
                          <button
                            onClick={() => {
                              const loading = activeQueue.entries.find(e => e.status === 'loading');
                              updateEntryStatus(activeQueue._id, loading._id, 'depart');
                            }}
                            className="btn-ghost text-sm flex-1 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            Confirm Departure
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-500">Select a queue to view details</p>
            </div>
          )}
        </div>
      </div>

      <CreateQueueModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={refetch} />
    </div>
  );
}
