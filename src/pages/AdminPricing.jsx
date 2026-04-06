import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminPricing() {
  const { cars, fetchCars } = useStore();

  // Global settings state
  const [settings, setSettings] = useState({
    defaultDailyKmLimit: 300,
    defaultExtraKmCharge: 12,
    lateReturnChargePerHour: 150,
    upiId: '',
    qrCode: ''
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // Per-car edit state
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({ dailyKmLimit: 300, extraKmCharge: 12 });
  const [savingCar, setSavingCar] = useState(false);

  useEffect(() => {
    fetchCars();
    fetchSettings();
  }, [fetchCars]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSavedMsg('Global settings saved!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      alert('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleQRUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('qrCode', file);
    try {
      const res = await fetch(`${API_BASE}/upload`, { 
         method: 'POST', 
         body: formData 
      });
      const data = await res.json();
      if (data.qrCode) {
         setSettings({ ...settings, qrCode: data.qrCode });
      }
    } catch (err) {
      alert('Failed to upload QR code.');
    }
  };

  const openCarEdit = (car) => {
    setEditingCar(car);
    setCarForm({ dailyKmLimit: car.dailyKmLimit || 300, extraKmCharge: car.extraKmCharge || 12 });
  };

  const saveCarPricing = async () => {
    setSavingCar(true);
    try {
      await fetch(`${API_BASE}/cars/${editingCar._id || editingCar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingCar, ...carForm })
      });
      await fetchCars();
      setEditingCar(null);
    } catch {
      alert('Failed to save car pricing.');
    } finally {
      setSavingCar(false);
    }
  };

  return (
    <AdminLayout activePage="pricing">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <span className="px-5 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl inline-block shadow-lg">Rental Rules</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-none">Pricing & Limits.</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control extra KM charges, daily limits and late return fees.</p>
        </div>
      </div>

      {/* ── Global Default Settings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
              <span className="material-symbols-outlined text-xl">tune</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Global Default Rates</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Applied to all cars unless overridden.</p>
            </div>
          </div>

          {loadingSettings ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily KM Limit */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Default Daily Limit (KM)</p>
                  <input type="number" className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-2xl font-bold text-slate-900 outline-none" value={settings.defaultDailyKmLimit} onChange={e => setSettings({ ...settings, defaultDailyKmLimit: Number(e.target.value) })} />
                </div>
                {/* Extra KM Charge */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Extra KM Charge (₹)</p>
                  <input type="number" className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-2xl font-bold text-slate-900 outline-none" value={settings.defaultExtraKmCharge} onChange={e => setSettings({ ...settings, defaultExtraKmCharge: Number(e.target.value) })} />
                </div>
                {/* Late Return Charge */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 md:col-span-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Late Return Fee (₹/hr)</p>
                  <input type="number" className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-2xl font-bold text-slate-900 outline-none" value={settings.lateReturnChargePerHour} onChange={e => setSettings({ ...settings, lateReturnChargePerHour: Number(e.target.value) })} />
                </div>
              </div>
              <button onClick={saveSettings} disabled={savingSettings} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all disabled:opacity-50">
                {savingSettings ? 'Saving...' : 'Save Global Rates'}
              </button>
            </div>
          )}
        </div>

        {/* ── Payment Info Settings ── */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/20">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Payment Setup</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage global UPI and QR code.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Business UPI ID</label>
               <input 
                  type="text" 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 text-sm" 
                  value={settings.upiId || ''} 
                  onChange={e => setSettings({...settings, upiId: e.target.value})} 
                  placeholder="e.g. business@upi"
               />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Payment QR Code</label>
               <div className="relative h-56 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:bg-slate-100 transition-all cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleQRUpload(e.target.files[0])} />
                  {settings.qrCode ? (
                     <img src={API_BASE.replace('/api', '') + settings.qrCode} className="w-full h-full object-contain p-4" alt="QR" />
                  ) : (
                     <>
                        <span className="material-symbols-outlined text-4xl text-slate-300">qr_code_2</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">Upload QR Code</p>
                     </>
                  )}
               </div>
               {settings.qrCode && (
                  <button 
                    onClick={() => setSettings({...settings, qrCode: ''})}
                    className="text-[9px] font-bold text-red-600 uppercase tracking-widest hover:underline w-full text-center"
                  >
                    Delete QR Code
                  </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Per-Car Pricing Overrides ── */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/20">
            <span className="material-symbols-outlined text-xl">directions_car</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Per-Car Limits & Rates</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Override global defaults for specific vehicles.</p>
          </div>
        </div>

        {/* Car Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price/Day</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Daily KM Limit</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Extra KM Rate</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cars.map((car) => (
                <tr key={car._id || car.id} className="hover:bg-slate-50 group transition-all border-l-4 border-transparent hover:border-red-600">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src={car.image} alt={car.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 uppercase">{car.name}</p>
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{car.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-base font-bold text-slate-900">₹{car.price}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">per day</p>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${car.dailyKmLimit && car.dailyKmLimit !== 300 ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'}`}>
                      {car.dailyKmLimit || 300} KM
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${car.extraKmCharge && car.extraKmCharge !== 12 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-500'}`}>
                      ₹{car.extraKmCharge || 12}/km
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button
                      onClick={() => openCarEdit(car)}
                      className="w-10 h-10 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all ml-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Car Cards (Mobile) */}
        <div className="md:hidden space-y-4">
          {cars.map((car) => (
            <div key={car._id || car.id} className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex items-center gap-4">
              <div className="w-16 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                <img src={car.image} alt={car.name} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 uppercase leading-none">{car.name}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{car.dailyKmLimit || 300} KM/day</span>
                  <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">₹{car.extraKmCharge || 12}/km</span>
                </div>
              </div>
              <button
                onClick={() => openCarEdit(car)}
                className="w-10 h-10 bg-white text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Car Pricing Edit Modal ── */}
      {editingCar && (
        <div className="fixed inset-0 z-[3000] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white w-full md:max-w-md md:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:mx-6">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Edit Car Pricing</p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">{editingCar.name}</h3>
              </div>
              <button onClick={() => setEditingCar(null)} className="w-10 h-10 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form */}
            <div className="p-8 space-y-6">
              
              {/* Car Preview */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-5 border border-slate-100">
                <img src={editingCar.image} alt={editingCar.name} className="w-24 h-14 object-contain" />
                <div>
                  <p className="text-base font-bold text-slate-900 uppercase leading-none">{editingCar.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">₹{editingCar.price}/day base rent</p>
                </div>
              </div>

              {/* Daily KM Limit */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-base">speed</span>
                  Daily KM Included
                </label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 px-5 py-3">
                  <input
                    type="number"
                    className="flex-1 bg-transparent outline-none text-2xl font-bold text-slate-900"
                    value={carForm.dailyKmLimit}
                    onChange={e => setCarForm({ ...carForm, dailyKmLimit: Number(e.target.value) })}
                  />
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">KM / day</span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-1">Customer drives up to this KM free per day</p>
              </div>

              {/* Extra KM Charge */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500 text-base">add_road</span>
                  Extra KM Charge
                </label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 px-5 py-3">
                  <span className="text-xl font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    className="flex-1 bg-transparent outline-none text-2xl font-bold text-slate-900"
                    value={carForm.extraKmCharge}
                    onChange={e => setCarForm({ ...carForm, extraKmCharge: Number(e.target.value) })}
                  />
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/ km</span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-1">Charged per km beyond the daily limit</p>
              </div>

              {/* Preview Calculation */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Example: 2-day rental, 750 KM driven</p>
                <div className="space-y-2 text-xs font-bold">
                  <div className="flex justify-between"><span className="text-slate-400">Included KM</span><span>{(carForm.dailyKmLimit * 2).toLocaleString()} KM</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Extra KM</span><span className="text-orange-400">{Math.max(0, 750 - carForm.dailyKmLimit * 2)} KM</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-2"><span className="text-slate-400">Extra KM charge</span><span className="text-red-400">₹{(Math.max(0, 750 - carForm.dailyKmLimit * 2) * carForm.extraKmCharge).toLocaleString()}</span></div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 pb-4">
                <button onClick={() => setEditingCar(null)} className="py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={saveCarPricing} disabled={savingCar} className="py-5 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all disabled:opacity-50">
                  {savingCar ? 'Saving...' : 'Save Rates'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPricing;
