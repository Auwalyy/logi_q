import { useState } from 'react';
import { AlertTriangle, Plus, Loader2, Phone } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import api from '../lib/api';

function ReportModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ type: 'accident', location: '', description: '', reporterPhone: '', severity: 'medium' });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/emergencies', form);
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Report Emergency">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Type</label>
            <select className="input" value={form.type} onChange={f('type')}>
              {['accident', 'breakdown', 'security', 'medical', 'fire', 'other'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Severity</label>
            <select className="input" value={form.severity} onChange={f('severity')}>
              {['low', 'medium', 'high', 'critical'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Location</label>
          <input className="input" placeholder="Kano-Kaduna Highway, KM 45" value={form.location} onChange={f('location')} required />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Reporter Phone</label>
          <input className="input" placeholder="+2348012345678" value={form.reporterPhone} onChange={f('reporterPhone')} required />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Describe the emergency…" value={form.description} onChange={f('description')} />
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
          ⚠ Submitting will trigger automated voice alerts and SMS to emergency contacts.
        </div>
        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2" disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          Report Emergency
        </button>
      </form>
    </Modal>
  );
}

export default function Emergencies() {
  const { data: emergencies, loading, refetch } = useFetch('/emergencies');
  const [showReport, setShowReport] = useState(false);

  const updateStatus = async (id, status) => {
    try { await api.put(`/emergencies/${id}/status`, { status }); refetch(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner size="lg" />;

  const open = emergencies?.filter(e => e.status !== 'resolved') ?? [];
  const resolved = emergencies?.filter(e => e.status === 'resolved') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Emergencies</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {open.length > 0
              ? <span className="text-red-400 font-medium">{open.length} active emergency{open.length > 1 ? 's' : ''}</span>
              : 'All clear'}
          </p>
        </div>
        <button onClick={() => setShowReport(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Report Emergency
        </button>
      </div>

      {open.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle size={15} /> Active Emergencies
          </h2>
          {open.map(e => (
            <div key={e._id} className="card border-red-500/20 bg-red-500/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={e.severity} />
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md capitalize">{e.type}</span>
                    <Badge status={e.status} />
                  </div>
                  <p className="font-semibold text-white">{e.location}</p>
                  {e.description && <p className="text-sm text-gray-400 mt-1">{e.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Phone size={11} /> {e.reporterPhone}</span>
                    <span>{new Date(e.createdAt).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {e.voiceAlertSent && <span className="text-emerald-400">✓ Voice alert sent</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {e.status === 'reported' && (
                    <button onClick={() => updateStatus(e._id, 'acknowledged')} className="text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors">
                      Acknowledge
                    </button>
                  )}
                  {e.status === 'acknowledged' && (
                    <button onClick={() => updateStatus(e._id, 'responding')} className="text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors">
                      Responding
                    </button>
                  )}
                  {['acknowledged', 'responding'].includes(e.status) && (
                    <button onClick={() => updateStatus(e._id, 'resolved')} className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500">Resolved ({resolved.length})</h2>
          {resolved.slice(0, 10).map(e => (
            <div key={e._id} className="card opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={e.severity} />
                    <span className="text-xs text-gray-500 capitalize">{e.type}</span>
                  </div>
                  <p className="text-sm text-gray-300">{e.location}</p>
                </div>
                <div className="text-right">
                  <Badge status="resolved" />
                  <p className="text-xs text-gray-600 mt-1">{new Date(e.resolvedAt || e.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!emergencies?.length && (
        <div className="card text-center py-16">
          <AlertTriangle size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No emergencies reported</p>
        </div>
      )}

      <ReportModal open={showReport} onClose={() => setShowReport(false)} onCreated={refetch} />
    </div>
  );
}
