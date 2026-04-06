import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetPassword = async (email) => {
    const newPassword = window.prompt(`Enter new password for ${email}:`);
    if (newPassword && newPassword.length >= 6) {
      try {
        const response = await fetch(`${API_BASE}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, newPassword })
        });
        if (response.ok) {
          alert('Password reset successfully.');
        } else {
          alert('Reset failed.');
        }
      } catch (err) {
        alert('Action failed.');
      }
    } else if (newPassword) {
      alert('Password must be at least 6 characters.');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user permanently?')) {
      try {
        const response = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setUsers(users.filter(u => u._id !== id));
        } else {
          alert('Failed to delete this user.');
        }
      } catch (err) {
        alert('Action failed. Please try again.');
      }
    }
  };

  return (
    <AdminLayout activePage="users">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2 animate-in fade-in duration-700">
        <div className="space-y-3">
          <span className="px-5 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl inline-block shadow-lg">Customer Hub</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none">All Users.</h2>
        </div>
        <div className="px-10 py-6 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl self-start md:self-auto">
          Total Accounts: {users.length}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-12 transition-all hover:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</th>
                <th className="px-6 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Role</th>
                <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-all border-l-4 border-transparent hover:border-red-600 group">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center rounded-2xl font-bold text-sm uppercase">{(user.name || 'U')[0]}</div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                     </div>
                  </td>
                  <td className="px-6 py-8 text-sm font-bold text-slate-400 lowercase overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{user.email}</td>
                  <td className="px-6 py-8 text-sm font-bold text-slate-900 tracking-widest">{user.phone || '--'}</td>
                  <td className="px-6 py-8 text-center">
                     <span className="px-5 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200">{user.role || 'USER'}</span>
                  </td>
                  <td className="px-10 py-8 text-right opacity-0 group-hover:opacity-100 transition-all">
                     <div className="flex items-center justify-end gap-2">
                       <button 
                           onClick={(e) => { e.stopPropagation(); resetPassword(user.email); }}
                           className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center"
                           title="Reset Password"
                       >
                           <span className="material-symbols-outlined text-sm font-bold">lock_reset</span>
                       </button>
                       <button 
                           onClick={(e) => { e.stopPropagation(); deleteUser(user._id); }}
                           className="w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                           title="Delete User"
                       >
                           <span className="material-symbols-outlined text-sm font-bold">delete</span>
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-6 px-2 pb-12">
         {users.map((user) => (
            <div 
               key={user._id} 
               className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8"
            >
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 bg-red-600 text-white flex items-center justify-center rounded-3xl font-bold text-lg uppercase shadow-lg">{(user.name || 'U')[0]}</div>
                     <div>
                        <p className="text-base font-bold text-slate-900 leading-none mb-2">{user.name}</p>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full">{user.role || 'User'}</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => resetPassword(user.email)}
                        className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                     >
                        <span className="material-symbols-outlined text-xl font-bold">lock_reset</span>
                     </button>
                     <button 
                        onClick={() => deleteUser(user._id)}
                        className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                     >
                        <span className="material-symbols-outlined text-xl font-bold">delete</span>
                     </button>
                  </div>
               </div>

               <div className="space-y-5 pt-8 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Email</span>
                     <span className="text-slate-700 lowercase overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Phone</span>
                     <span className="text-slate-700">{user.phone || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                     <span className="text-slate-400">User ID</span>
                     <span className="text-slate-400 font-mono">#{user._id.slice(-8).toUpperCase()}</span>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 mx-2 md:mx-0">
           <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200 mx-auto mb-10"><span className="material-symbols-outlined text-7xl font-thin">group</span></div>
           <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No users registered yet.</p>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCustomers;
