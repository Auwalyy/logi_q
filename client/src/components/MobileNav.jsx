import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, Route, Truck, BarChart3 } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/queues', icon: ListOrdered, label: 'Queues' },
  { to: '/trips', icon: Route, label: 'Trips' },
  { to: '/drivers', icon: Truck, label: 'Drivers' },
  { to: '/analytics', icon: BarChart3, label: 'Stats' },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 flex">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-400' : 'text-gray-500'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
