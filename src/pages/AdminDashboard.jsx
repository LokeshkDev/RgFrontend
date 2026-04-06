import React from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { bookings, fetchBookings } = useStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const activeBookings = bookings.filter(b => b.status === 'Confirmed').length;
  const drivingNow = bookings.filter(b => b.status === 'Driving').length;
  
  return (
    <AdminLayout activePage="dashboard">
      {/* Page Header */}
      <div className="mb-12 px-2 animate-in fade-in duration-700">
        <p className="text-red-600 font-bold text-[10px] uppercase tracking-widest mb-4 leading-none">Admin Control Panel</p>
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-none">Dashboard.</h2>
        <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-4">Live booking and revenue overview.</p>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 font-body">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:border-red-600/10 group">
          <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-red-50 rounded-2xl text-red-600 flex items-center justify-center shadow-sm border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
              <span className="material-symbols-outlined text-2xl font-bold">payments</span>
            </div>
            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-4 py-1.5 rounded-full uppercase border border-green-100 tracking-widest">Live</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">Total Revenue</p>
          <p className="text-4xl font-bold text-slate-900 tracking-tight">₹ {totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:border-red-600/10 group">
          <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
               <span className="material-symbols-outlined text-2xl font-bold">bookmark_added</span>
            </div>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase border border-blue-100 tracking-widest">Confirmed</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">Active Bookings</p>
          <p className="text-4xl font-bold text-slate-900 tracking-tight">{activeBookings}</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:border-red-600/10 group">
          <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl text-white flex items-center justify-center shadow-xl group-hover:bg-red-600 transition-all duration-500">
               <span className="material-symbols-outlined text-2xl font-bold">directions_car</span>
            </div>
            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-4 py-1.5 rounded-full uppercase border border-red-100 tracking-widest animate-pulse">On Road</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">Cars Driving Now</p>
          <p className="text-4xl font-bold text-slate-900 tracking-tight">{drivingNow}</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:border-red-600/10 group">
          <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl text-slate-400 flex items-center justify-center border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
               <span className="material-symbols-outlined text-2xl font-bold">group</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full uppercase border border-slate-100 tracking-widest">Total</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">All Bookings</p>
          <p className="text-4xl font-bold text-slate-900 tracking-tight">{bookings.length}</p>
        </div>
      </div>

      {/* Recent Bookings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-12">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] shadow-sm border border-slate-100 p-12 space-y-10">
           <div className="flex justify-between items-center border-b border-slate-50 pb-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Recent Bookings.</h3>
              <button 
                 onClick={() => navigate('/admin/bookings')}
                 className="px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-bold text-red-600 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                 View All
              </button>
           </div>
           <div className="space-y-5">
              {bookings.slice(0, 5).map((booking) => (
                 <div key={booking._id || booking.id} className="flex items-center gap-6 p-6 md:p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-red-600/30 transition-all duration-500 hover:bg-white hover:shadow-lg">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-xl uppercase group-hover:bg-red-600 transition-all">RG</div>
                    <div className="flex-1 min-w-0">
                       <p className="text-base font-bold text-slate-900 tracking-tight leading-none truncate">{booking.userData?.name} <span className="text-slate-300 font-normal px-2">/</span> {booking.car?.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 leading-none">{new Date(booking.date).toDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                       <span className="text-lg font-bold text-slate-900 block tracking-tight">₹ {(booking.totalAmount || 0).toLocaleString()}</span>
                       <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Confirmed</span>
                    </div>
                 </div>
              ))}
              {bookings.length === 0 && <div className="py-24 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No bookings yet.</div>}
           </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[3.5rem] p-12 relative overflow-hidden flex flex-col justify-between border border-white/5 shadow-2xl h-[380px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-600 opacity-20 blur-[130px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10 space-y-8">
                 <h3 className="text-4xl font-bold text-white leading-none tracking-tight">Manage<br/>Fleet.</h3>
                 <p className="text-white/40 font-medium text-sm leading-relaxed">Add, edit, or remove vehicles from your active fleet inventory.</p>
              </div>
              <button onClick={() => navigate('/admin/fleet')} className="relative z-10 w-full py-7 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-2xl shadow-red-600/30 hover:bg-white hover:text-black transition-all">Go to Fleet</button>
           </div>
           
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Confirmed</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{activeBookings}</p>
                 </div>
                 <div className="space-y-2 text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">On Road</p>
                    <p className="text-2xl font-bold text-red-600 tracking-tight leading-none">{drivingNow}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Revenue</p>
                    <p className="text-lg font-bold text-slate-900 tracking-tight leading-none">₹{(totalRevenue / 1000).toFixed(1)}k</p>
                 </div>
                 <div className="space-y-2 text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Total</p>
                    <p className="text-lg font-bold text-slate-900 tracking-tight leading-none">{bookings.length}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
