import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentAdmin } = useStore();

  // Reset Password Modal State
  const [resetModal, setResetModal] = useState({ show: false, email: '', newPassword: '', loading: false });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${currentAdmin?.token}` }
      });
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

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (resetModal.newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setResetModal({ ...resetModal, loading: true });
    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentAdmin?.token}`
        },
        body: JSON.stringify({ 
          identifier: resetModal.email, 
          newPassword: resetModal.newPassword 
        })
      });
      if (response.ok) {
        alert(`Security credentials updated for ${resetModal.email}`);
        setResetModal({ show: false, email: '', newPassword: '', loading: false });
      } else {
        alert('Reset sequence failure.');
        setResetModal({ ...resetModal, loading: false });
      }
    } catch (err) {
      alert('Network error during reset.');
      setResetModal({ ...resetModal, loading: false });
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user permanently?')) {
      try {
        const response = await fetch(`${API_BASE}/users/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${currentAdmin?.token}` }
        });
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
        <div className="px-10 py-6 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl self-start md:self-auto transition-all hover:scale-105">
          Total Accounts: {users.length}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-12 transition-all hover:shadow-2xl">
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
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-all border-l-4 border-transparent hover:border-red-600 group">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center rounded-2xl font-bold text-sm uppercase">{(u.name || 'U')[0]}</div>
                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                     </div>
                  </td>
                  <td className="px-6 py-8 text-sm font-bold text-slate-400 lowercase truncate max-w-[200px]">{u.email}</td>
                  <td className="px-6 py-8 text-sm font-bold text-slate-900 tracking-widest">{u.phone || '--'}</td>
                  <td className="px-6 py-8 text-center">
                     <span className="px-5 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200">{u.role || 'USER'}</span>
                  </td>
                  <td className="px-10 py-8 text-right opacity-0 group-hover:opacity-100 transition-all">
                     <div className="flex items-center justify-end gap-2">
                       <button 
                            onClick={() => setResetModal({ show: true, email: u.email, newPassword: '', loading: false })}
                            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center active:scale-90"
                            title="Reset Password"
                       >
                            <span className="material-symbols-outlined text-sm font-bold">lock_reset</span>
                       </button>
                       <button 
                            onClick={() => deleteUser(u._id)}
                            className="w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center active:scale-90"
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
         {users.map((u) => (
            <div 
               key={u._id} 
               className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8 animate-in slide-in-from-bottom-4 duration-500"
            >
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 bg-red-600 text-white flex items-center justify-center rounded-3xl font-bold text-lg uppercase shadow-lg">{(u.name || 'U')[0]}</div>
                     <div>
                        <p className="text-base font-bold text-slate-900 leading-none mb-2">{u.name}</p>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full">{u.role || 'User'}</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => setResetModal({ show: true, email: u.email, newPassword: '', loading: false })}
                        className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                     >
                        <span className="material-symbols-outlined text-xl font-bold">lock_reset</span>
                     </button>
                     <button 
                        onClick={() => deleteUser(u._id)}
                        className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                     >
                        <span className="material-symbols-outlined text-xl font-bold">delete</span>
                     </button>
                  </div>
               </div>

               <div className="space-y-5 pt-8 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Email</span>
                     <span className="text-slate-700 lowercase truncate max-w-[180px]">{u.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Phone</span>
                     <span className="text-slate-700">{u.phone || '--'}</span>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Manual Reset Modal */}
      {resetModal.show && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-500 border border-slate-100">
               <button 
                 onClick={() => setResetModal({ ...resetModal, show: false })}
                 className="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-90"
               >
                  <span className="material-symbols-outlined">close</span>
               </button>

               <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm"><span className="material-symbols-outlined text-3xl">lock_open</span></div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Manual Reset.</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Setting password for {resetModal.email.split('@')[0]}</p>
               </div>

               <form onSubmit={handleResetSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                     <input 
                        type="text" 
                        required 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30 transition-all" 
                        placeholder="Type new secure password" 
                        value={resetModal.newPassword} 
                        onChange={e => setResetModal({...resetModal, newPassword: e.target.value})} 
                        autoFocus
                     />
                     <p className="text-[9px] text-slate-300 font-medium pl-1">Minimum 6 characters required.</p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={resetModal.loading}
                    className="w-full py-5 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
                  >
                     {resetModal.loading ? 'Updating Registry...' : 'Override Password'}
                     {!resetModal.loading && <span className="material-symbols-outlined text-sm">save</span>}
                  </button>
               </form>
            </div>
         </div>
      )}

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
