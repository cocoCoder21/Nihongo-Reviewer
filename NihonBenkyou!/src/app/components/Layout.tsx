import { NavLink, Outlet } from 'react-router';
import { LayoutGrid, CheckSquare, BookOpen, Clock, UserCircle, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export const AppLayout = () => {
  const { stats, user } = useAppStore();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-brand-100 font-sans text-slate-900 flex flex-col md:flex-row selection:bg-brand-200 selection:text-brand-700 overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-brand-200/50 p-6">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-sm">
            <span className="text-xl font-bold leading-none mt-0.5">日</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">NihonGuide</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={<LayoutGrid />} label="Dashboard" />
          <NavItem to="/learn" icon={<BookOpen />} label="Learn" />
          <NavItem to="/practice" icon={<CheckSquare />} label="Practice" />
          <NavItem to="/planner" icon={<Clock />} label="Planner" />
        </nav>

        <div className="mt-auto">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => twMerge(
              clsx(
                "flex items-center space-x-3 p-3 rounded-2xl border transition-all", 
                isActive ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-brand-100/50 border-transparent hover:bg-brand-100 hover:border-brand-200"
              )
            )}
          >
            <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
              {(authUser?.displayName ?? user.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">JLPT {user.level} Path</p>
              <p className="text-xs font-medium text-slate-500">{(stats.xp / stats.xpGoal * 100).toFixed(0)}% daily goal</p>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden w-full px-6 py-4 flex items-center justify-between bg-white border-b border-brand-200/50 z-10 sticky top-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white shadow-sm">
              <span className="text-base font-bold leading-none mt-0.5">日</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">NihonGuide</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <Bell className="w-5 h-5" />
            <NavLink to="/profile">
              <UserCircle className="w-6 h-6 hover:text-brand-700 transition-colors" />
            </NavLink>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden bg-white border-t border-brand-200/50 flex items-center justify-around pb-safe z-10 sticky bottom-0">
          <MobileNavItem to="/" icon={<LayoutGrid />} label="Dash" />
          <MobileNavItem to="/learn" icon={<BookOpen />} label="Learn" />
          <MobileNavItem to="/practice" icon={<CheckSquare />} label="Practice" />
          <MobileNavItem to="/planner" icon={<Clock />} label="Planner" />
        </nav>
      </main>
    </div>
  );
};

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => twMerge(
        clsx(
          "flex items-center space-x-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all", 
          isActive ? "bg-brand-500/10 text-brand-700" : "text-slate-500 hover:bg-brand-100 hover:text-brand-700"
        )
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function MobileNavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => twMerge(
        clsx(
          "flex flex-col items-center justify-center py-3 px-4 space-y-1 transition-all", 
          isActive ? "text-brand-700" : "text-slate-400 hover:text-brand-500"
        )
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </NavLink>
  );
}