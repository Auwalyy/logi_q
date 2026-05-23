import { Truck, ListOrdered, Route, AlertTriangle, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function Dashboard() {
  const { data, loading, refetch } = useFetch('/analytics/overview');
  const { data: queues } = useFetch('/queues');

  if (loading) return <Spinner size="lg" />;

  const stats = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live transport activity overview</p>
        </div>
        <button onClick={refetch} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Drivers" value={stats.activeDrivers} icon={Truck} color="blue" />
        <StatCard label="Active Queues" value={stats.activeQueues} icon={ListOrdered} color="green" />
        <StatCard label="Today's Departures" value={stats.todayDepartures} icon={Route} color="purple" />
        <StatCard label="Open Emergencies" value={stats.emergencies} icon={AlertTriangle} color={stats.emergencies > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Trips" value={stats.totalTrips?.toLocaleString()} icon={TrendingUp} color="blue" />
        <StatCard label="Avg Delay" value={`${stats.avgDelayMinutes ?? 0} min`} icon={Clock} color="amber" sub="across all routes" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Queues */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <ListOrdered size={17} className="text-brand-400" />
            Active Queues
          </h2>
          {queues?.length ? (
            <div className="space-y-3">
              {queues.slice(0, 5).map(q => (
                <div key={q._id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{q.route}</p>
                    <p className="text-xs text-gray-500">{q.park} · {q.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-400">{q.entries?.filter(e => ['waiting','loading'].includes(e.status)).length ?? 0} vehicles</p>
                    <Badge status={q.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-6">No active queues</p>
          )}
        </div>

        {/* Recent Departures */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Route size={17} className="text-brand-400" />
            Recent Departures
          </h2>
          {stats.recentTrips?.length ? (
            <div className="space-y-3">
              {stats.recentTrips.map(t => (
                <div key={t._id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{t.origin} → {t.destination}</p>
                    <p className="text-xs text-gray-500">{t.driver?.name} · {t.vehicle?.plateNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {t.actualDeparture ? new Date(t.actualDeparture).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                    <Badge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-6">No recent departures</p>
          )}
        </div>
      </div>
    </div>
  );
}
