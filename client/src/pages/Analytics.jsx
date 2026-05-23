import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useFetch } from '../hooks/useFetch';
import Spinner from '../components/ui/Spinner';
import StatCard from '../components/ui/StatCard';
import { TrendingUp, Route, Clock, Truck } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: overview, loading: l1 } = useFetch('/analytics/overview');
  const { data: routes, loading: l2 } = useFetch('/analytics/routes');
  const { data: byDay, loading: l3 } = useFetch('/analytics/departures-by-day');
  const { data: cargo, loading: l4 } = useFetch('/analytics/cargo');

  if (l1 || l2 || l3 || l4) return <Spinner size="lg" />;

  const routeData = routes?.map(r => ({ name: r._id || 'Unknown', trips: r.count, delay: Math.round(r.avgDelay || 0), passengers: r.totalPassengers })) ?? [];
  const dayData = byDay?.map(d => ({ date: d._id?.slice(5), departures: d.count })) ?? [];
  const cargoData = cargo?.map(c => ({ name: c._id || 'Unknown', weight: c.totalWeight, trips: c.count })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Transport performance insights</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Trips" value={overview?.totalTrips?.toLocaleString()} icon={TrendingUp} color="blue" />
        <StatCard label="Today's Departures" value={overview?.todayDepartures} icon={Route} color="green" />
        <StatCard label="Avg Delay" value={`${overview?.avgDelayMinutes ?? 0}m`} icon={Clock} color="amber" />
        <StatCard label="Active Drivers" value={overview?.activeDrivers} icon={Truck} color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Departures by day */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Daily Departures (Last 30 Days)</h2>
          {dayData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="departures" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm text-center py-10">No departure data yet</p>}
        </div>

        {/* Busiest routes */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Busiest Routes</h2>
          {routeData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={routeData.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 10 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="trips" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm text-center py-10">No route data yet</p>}
        </div>

        {/* Avg delay by route */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Average Delay by Route (minutes)</h2>
          {routeData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={routeData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="delay" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Avg Delay (min)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm text-center py-10">No delay data yet</p>}
        </div>

        {/* Cargo by destination */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Cargo Volume by Destination</h2>
          {cargoData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={cargoData.slice(0, 6)} dataKey="weight" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {cargoData.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm text-center py-10">No cargo data yet</p>}
        </div>
      </div>

      {/* Route table */}
      {routeData.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white">Route Performance Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Route', 'Total Trips', 'Total Passengers', 'Avg Delay (min)'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routeData.map((r, i) => (
                  <tr key={i} className="table-row">
                    <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                    <td className="px-4 py-3 text-gray-300">{r.trips}</td>
                    <td className="px-4 py-3 text-gray-300">{r.passengers?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${r.delay > 30 ? 'text-red-400' : r.delay > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {r.delay}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
