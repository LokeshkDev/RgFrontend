import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert('Error deleting user.');
      }
    }
  };

  return (
    <AdminLayout activePage="customers">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <span className="text-red-600 font-bold text-xs uppercase tracking-widest">User Management</span>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-none mb-2">Platform Users</h2>
          <p className="text-slate-500 font-medium">Manage and monitor all registered accounts on RG Self Drive.</p>
        </div>
        <div className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl">Total Users: {users.length}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Name</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Role</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-all border-l-4 border-transparent hover:border-red-600 group">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 text-slate-600 flex items-center justify-center rounded-xl font-bold text-xs">{(user.name || 'U')[0]}</div>
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{user.name}</p>
                     </div>
                  </td>
                  <td className="px-6 py-8 text-sm text-slate-500 lowercase">{user.email}</td>
                  <td className="px-6 py-8 text-xs font-bold text-slate-900 tracking-wider font-mono">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-8">
                     <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${user.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role || 'USER'}
                     </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <button 
                        onClick={() => deleteUser(user._id)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                     >
                        <span className="material-symbols-outlined text-sm">delete</span>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !loading && (
          <div className="py-24 text-center">
             <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No users found in the system.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;
