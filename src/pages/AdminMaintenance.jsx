import React from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

function AdminMaintenance() {
  const cars = useStore(state => state.cars);

  return (
    <AdminLayout activePage="maintenance">
      <div className="mb-10">
        <h2 className="text-[40px] font-black text-indigo-950 tracking-tighter leading-none mb-2">Fleet Maintenance</h2>
        <p className="text-on-surface-variant font-medium">Schedule service and track vehicle health for peak performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
         <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-10">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div>
               <p className="text-4xl font-black text-indigo-900">3</p>
               <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1 mt-1">Scheduled Service Due</p>
            </div>
         </div>
         <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-10">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <div>
               <p className="text-4xl font-black text-indigo-900">92%</p>
               <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1 mt-1">Average Fleet Health Index</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 space-y-8">
         <h3 className="text-2xl font-black text-indigo-900 border-l-4 border-indigo-950 pl-6 tracking-tight">Active Maintenance Logs</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car, i) => (
              <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-6 shadow-sm flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${i % 3 === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>{i % 3 === 0 ? 'SERVICE DUE' : 'OPERATIONAL'}</span>
                      <span className="material-symbols-outlined text-slate-300">history</span>
                   </div>
                   <h4 className="text-lg font-black text-indigo-950 tracking-tight">{car.name}</h4>
                   <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Last Service: Oct 12, 2023</p>
                </div>
                <div className="space-y-4 pt-6 border-t border-slate-200">
                   <div className="flex justify-between text-xs font-bold">
                      <span className="text-on-surface-variant">Tire Pressure</span>
                      <span className="text-green-600 font-extrabold uppercase">Good</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold">
                      <span className="text-on-surface-variant">Oil Life</span>
                      <span className="text-indigo-900 font-extrabold">88%</span>
                   </div>
                   <button className="w-full py-4 bg-indigo-950 text-white rounded-2xl font-black text-xs hover:scale-[1.03] transition-all">SCHEDULE CHECKUP</button>
                </div>
              </div>
            ))}
         </div>
      </div>
    </AdminLayout>
  );
}

export default AdminMaintenance;
