import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ListOrdered, Truck, Route,
  AlertTriangle, BarChart3, Bell, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/queues', icon: ListOrdered, label: 'Queues' },
  { to: '/trips', icon: Route, label: 'Trips' },
  { to: '/drivers', icon: Truck, label: 'Drivers' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/emergencies', icon: AlertTriangle, label: 'Emergencies' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="hidden md:flex flex-col w-60 bg-gray-900 border-r border-gray-800 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-lg tracking-tight">Parka</span>
          <p className="text-[10px] text-gray-500 -mt-0.5 uppercase tracking-widest">Transport Hub</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600/15 text-brand-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
