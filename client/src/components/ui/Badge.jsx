const map = {
  active: 'bg-emerald-500/15 text-emerald-400',
  waiting: 'bg-amber-500/15 text-amber-400',
  loading: 'bg-blue-500/15 text-blue-400',
  departed: 'bg-gray-500/15 text-gray-400',
  in_queue: 'bg-brand-500/15 text-brand-400',
  available: 'bg-emerald-500/15 text-emerald-400',
  offline: 'bg-gray-600/15 text-gray-500',
  scheduled: 'bg-purple-500/15 text-purple-400',
  arrived: 'bg-teal-500/15 text-teal-400',
  cancelled: 'bg-red-500/15 text-red-400',
  reported: 'bg-red-500/15 text-red-400',
  acknowledged: 'bg-amber-500/15 text-amber-400',
  responding: 'bg-blue-500/15 text-blue-400',
  resolved: 'bg-emerald-500/15 text-emerald-400',
  critical: 'bg-red-600/20 text-red-400',
  high: 'bg-orange-500/15 text-orange-400',
  medium: 'bg-amber-500/15 text-amber-400',
  low: 'bg-gray-500/15 text-gray-400',
  paused: 'bg-amber-500/15 text-amber-400',
  closed: 'bg-gray-600/15 text-gray-500',
};

export default function Badge({ status }) {
  return (
    <span className={`badge ${map[status] || 'bg-gray-700 text-gray-300'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
