import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

function AdminLayout({ children, activePage }) {
  const navigate = useNavigate();
  const { logout } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view', path: '/admin' },
    { id: 'fleet', label: 'Fleet', icon: 'directions_car', path: '/admin/fleet' },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_today', path: '/admin/bookings' },
    { id: 'users', label: 'Users', icon: 'group', path: '/admin/customers' },
    { id: 'locations', label: 'Locations', icon: 'location_on', path: '/admin/locations' },
    { id: 'pricing', label: 'Pricing Rules', icon: 'attach_money', path: '/admin/pricing' },
  ];

  // Bottom tab bar — 5 primary tabs
  const bottomTabs = [
    { id: 'dashboard', label: 'Home', icon: 'grid_view', path: '/admin' },
    { id: 'fleet', label: 'Fleet', icon: 'directions_car', path: '/admin/fleet' },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_today', path: '/admin/bookings' },
    { id: 'users', label: 'Users', icon: 'group', path: '/admin/customers' },
    { id: 'pricing', label: 'Pricing', icon: 'attach_money', path: '/admin/pricing' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-body selection:bg-red-500/20">
      
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex w-72 bg-slate-900 text-white flex-col sticky top-0 h-screen shadow-2xl z-[100]">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 mb-10">
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-red-600/20">R</div>
             <h1 className="text-xl font-bold tracking-tight uppercase">RG <span className="text-red-600">Admin</span></h1>
          </div>
          
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm tracking-tight transition-all duration-300 ${
                  activePage === item.id 
                    ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
           <div className="bg-slate-800/40 rounded-2xl p-5 space-y-2">
              <p className="text-xs font-bold text-white leading-none">RG Self Drive</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin Panel</p>
           </div>
           <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-4 px-6 py-4 w-full bg-slate-800/50 text-slate-400 rounded-2xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all"
           >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
           </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="h-16 lg:h-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-5 lg:px-10 sticky top-0 z-50 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="lg:hidden w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md">R</div>
              <div className="lg:hidden">
                 <p className="text-[11px] font-bold text-slate-900 leading-none">RG Admin</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control Panel</p>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Environment: <span className="text-red-600">Production</span></p>
           </div>
           <div className="flex items-center gap-3">
              <button className="relative p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors">
                 <span className="material-symbols-outlined text-[22px]">notifications</span>
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 border-2 border-white rounded-full"></span>
              </button>
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                 <img src="https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff" alt="Admin" className="w-full h-full object-cover" />
              </div>
              {/* Mobile logout — hidden, in tab bar "More" */}
           </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-12 pb-24 lg:pb-12 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* ─── Mobile Bottom Tab Bar (App Style) ─── */}
        <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-white/98 backdrop-blur-2xl border-t border-slate-100 lg:hidden flex items-center justify-around z-[150] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
           {bottomTabs.map((tab) => {
             const isActive = activePage === tab.id;
             return (
               <Link
                 key={tab.id}
                 to={tab.path}
                 className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
               >
                 {/* Active pill indicator */}
                 {isActive && (
                   <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-600 rounded-b-full"></span>
                 )}
                 <div className={`w-12 h-8 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-red-50' : ''}`}>
                   <span className={`material-symbols-outlined text-[22px] transition-all duration-300 ${isActive ? 'text-red-600' : 'text-slate-400'}`}>
                     {tab.icon}
                   </span>
                 </div>
                 <span className={`text-[9px] font-bold uppercase tracking-wide transition-colors ${isActive ? 'text-red-600' : 'text-slate-400'}`}>
                   {tab.label}
                 </span>
               </Link>
             );
           })}
        </nav>
      </div>
    </div>
  );
}

export default AdminLayout;
