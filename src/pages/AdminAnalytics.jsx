import React from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

function AdminAnalytics() {
  const bookings = useStore(state => state.bookings);
  
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const revenueTrend = bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0;

  return (
    <AdminLayout activePage="analytics">
      <div className="mb-10">
        <h2 className="text-[40px] font-black text-indigo-950 tracking-tighter leading-none mb-2">Performance Analytics</h2>
        <p className="text-on-surface-variant font-medium">Data-driven insights for optimization and scaling.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
         <div className="bg-indigo-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary opacity-20 blur-3xl"></div>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest opacity-60 mb-2">Total Platform Revenue</p>
            <p className="text-5xl font-black">₹ {totalRevenue}</p>
            <div className="mt-10 flex items-center gap-3">
               <span className="material-symbols-outlined text-green-400">trending_up</span>
               <span className="font-bold text-sm text-indigo-100">+14.2% from last month</span>
            </div>
         </div>
         
         <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Average Booking Value</p>
               <p className="text-4xl font-black text-indigo-900 leading-tight">₹ {revenueTrend}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-50 rounded-2xl">
               <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Target Achievement</p>
               <div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="w-[65%] h-full bg-primary"></div>
               </div>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Site Performance Index</p>
               <p className="text-4xl font-black text-indigo-900 leading-tight">98.2 / 100</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
               <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Server Latency</span>
               <span className="text-sm font-black text-green-600">42ms</span>
            </div>
         </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
         <h3 className="text-2xl font-black text-indigo-950 border-l-4 border-primary pl-6 tracking-tight">Revenue Distribution</h3>
         <div className="h-[300px] w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-end gap-1 px-10">
               {[ 40, 60, 30, 80, 50, 90, 70, 45, 85, 35, 55, 75 ].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/10 hover:bg-primary transition-all duration-500 rounded-t-xl" style={{ height: `${h}%` }}></div>
               ))}
            </div>
            <p className="relative z-10 text-slate-400 font-bold uppercase text-xs tracking-widest">Monthly Growth Trend</p>
         </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;
