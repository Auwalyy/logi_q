import { Bell, MessageSquare, Phone, Smartphone } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const channelIcon = { sms: MessageSquare, voice: Phone, ussd: Smartphone };
const typeColor = {
  queue_update: 'text-brand-400', loading_alert: 'text-amber-400',
  departure: 'text-emerald-400', delay: 'text-orange-400',
  otp: 'text-purple-400', emergency: 'text-red-400', boarding: 'text-teal-400',
};

export default function Notifications() {
  const { data: notifications, loading } = useFetch('/notifications');

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-500 text-sm mt-0.5">SMS, Voice & USSD activity log</p>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Channel', 'Type', 'Recipient', 'Message', 'Status', 'Time'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notifications?.map(n => {
                const Icon = channelIcon[n.channel] || Bell;
                return (
                  <tr key={n._id} className="table-row">
                    <td className="px-4 py-3">
                      <Icon size={15} className="text-gray-400" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium capitalize ${typeColor[n.type] || 'text-gray-400'}`}>
                        {n.type?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{n.recipient}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{n.message}</td>
                    <td className="px-4 py-3"><Badge status={n.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                );
              })}
              {!notifications?.length && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-10">No notifications yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
