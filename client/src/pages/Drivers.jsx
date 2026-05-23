import { useState } from 'react';
import { Plus, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import api from '../lib/api';

function RegisterDriverModal({ open, onClose, onCreated }) {
  const { data: vehicles } = useFetch('/vehicles');
  const [form, setForm] = useState({ name: '', phone: '', licenseNumber: '', password: 'driver123', vehicle: '' });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/drivers/register', form);
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Register Driver">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
          <input className="input" placeholder="Musa Abdullahi" value={form.name} onChange={f('name')} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Phone (with country code)</label>
            <input className="input" placeholder="+2348012345678" value={form.phone} onChange={f('phone')} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">License Number</label>
            <input className="input" placeholder="KN-2024-001" value={form.licenseNumber} onChange={f('licenseNumber')} required />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Assign Vehicle</label>
          <select className="input" value={form.vehicle} onChange={f('vehicle')}>
            <option value="">No vehicle yet</option>
            {vehicles?.map(v => <option key={v._id} value={v._id}>{v.plateNumber} — {v.type}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          Register Driver
        </button>
      </form>
    </Modal>
  );
}

export default function Drivers() {
  const { data: drivers, loading, refetch } = useFetch('/drivers');
  const [showRegister, setShowRegister] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = drivers?.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search) ||
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const sendOTP = async (id) => {
    try {
      await api.post(`/drivers/${id}/send-otp`);
      alert('OTP sent to driver');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Drivers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{drivers?.length ?? 0} registered drivers</p>
        </div>
        <button onClick={() => setShowRegister(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Register Driver
        </button>
      </div>

      <input
        className="input max-w-sm"
        placeholder="Search by name, phone, or license…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Driver', 'Phone', 'License', 'Vehicle', 'Status', 'Verified', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {d.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.totalTrips} trips</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{d.phone}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{d.licenseNumber}</td>
                  <td className="px-4 py-3 text-gray-300">{d.vehicle?.plateNumber || '—'}</td>
                  <td className="px-4 py-3"><Badge status={d.status} /></td>
                  <td className="px-4 py-3">
                    {d.isVerified
                      ? <span className="flex items-center gap-1 text-xs text-emerald-400"><ShieldCheck size={13} /> Verified</span>
                      : <span className="text-xs text-gray-500">Unverified</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => sendOTP(d._id)}
                      className="text-xs bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <KeyRound size={11} /> Send OTP
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-10">No drivers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterDriverModal open={showRegister} onClose={() => setShowRegister(false)} onCreated={refetch} />
    </div>
  );
}
