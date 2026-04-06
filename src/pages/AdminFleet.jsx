import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

function AdminFleet() {
  const { 
    cars, addCar, updateCar, deleteCar, 
    locations, fetchLocations,
    categories, fetchCategories, addCategory, deleteCategory 
  } = useStore();
  
  const [showAddCar, setShowAddCar] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const [editData, setEditData] = useState({
    name: '',
    category: '',
    price: 0,
    image: '',
    locations: [],
    dailyKmLimit: 300,
    extraKmCharge: 12,
    specs: { transmission: 'Auto', fuel: 'Petrol', seats: 5 }
  });

  useEffect(() => {
    fetchLocations();
    fetchCategories();
  }, [fetchLocations, fetchCategories]);

  useEffect(() => {
    if (selectedCar) {
      setEditData({
        ...selectedCar,
        locations: selectedCar.locations || [],
        dailyKmLimit: selectedCar.dailyKmLimit || 300,
        extraKmCharge: selectedCar.extraKmCharge || 12,
        specs: selectedCar.specs || { transmission: 'Auto', fuel: 'Petrol', seats: 5 }
      });
    } else {
      setEditData({
        name: '', category: categories[0]?.name || '', price: 2500, image: '',
        locations: [],
        dailyKmLimit: 300,
        extraKmCharge: 12,
        specs: { transmission: 'Auto', fuel: 'Petrol', seats: 5 }
      });
    }
  }, [selectedCar, showAddCar, categories]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!editData.name) {
      alert("Please enter the Car Name first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('carImage', file);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/upload?carName=${encodeURIComponent(editData.name)}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.carImage) {
        const ASSET_PATH = API_BASE.replace('/api', '') + data.carImage;
        setEditData({ ...editData, image: ASSET_PATH });
      }
    } catch (err) {
      console.error('Upload Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (selectedCar) {
      updateCar(selectedCar._id || selectedCar.id, editData);
    } else {
      addCar({ ...editData, status: 'Available' });
    }
    closeModal();
  };

  const closeModal = () => {
    setShowAddCar(false);
    setSelectedCar(null);
  };

  const handleLocationToggle = (locName) => {
    const currentLocs = editData.locations || [];
    if (currentLocs.includes(locName)) {
      setEditData({ ...editData, locations: currentLocs.filter(l => l !== locName) });
    } else {
      setEditData({ ...editData, locations: [...currentLocs, locName] });
    }
  };

  const handleDelete = () => {
    if (selectedCar && window.confirm('Are you sure you want to remove this car?')) {
      deleteCar(selectedCar._id || selectedCar.id);
      closeModal();
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim()).then(res => {
        if(res.success) setNewCatName('');
      });
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      'Available': 'bg-green-100 text-green-700',
      'Booked': 'bg-indigo-100 text-indigo-700',
      'Under Maintenance': 'bg-red-100 text-red-700',
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-700'}`}>{status || 'Available'}</span>;
  };

  return (
    <AdminLayout activePage="fleet">
      {/* Category Management Section */}
      <div className="mb-8 md:mb-12 bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm mx-2 md:mx-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Manage Categories</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Add or remove vehicle types</p>
          </div>
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <input 
              type="text" 
              placeholder="e.g. LUXURY" 
              className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-xs font-bold text-slate-900 outline-none focus:border-red-600/20 flex-1 md:w-64 uppercase"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all">Add</button>
          </form>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <div key={cat._id || cat.id} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{cat.name}</span>
              <button onClick={() => deleteCategory(cat._id || cat.id)} className="w-6 h-6 rounded-lg bg-white text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><span className="material-symbols-outlined text-[14px]">close</span></button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No categories added yet.</p>}
        </div>
      </div>

      {/* Fleet Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 px-2 md:px-0">
        <div className="space-y-3">
           <p className="text-red-600 font-bold text-xs uppercase tracking-widest">Inventory</p>
           <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Our Fleet.</h2>
        </div>
        <button 
           onClick={() => setShowAddCar(true)}
           className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all flex items-center gap-3 self-start md:self-auto"
        >
           <span className="material-symbols-outlined text-lg">add</span>
           Add New Car
        </button>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-2 md:px-0 pb-12">
        {cars.map((car) => (
           <div 
             key={car._id || car.id} 
             onClick={() => setSelectedCar(car)}
             className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 hover:border-red-600/20 hover:shadow-2xl transition-all duration-700 cursor-pointer group flex flex-col justify-between h-auto min-h-[520px]"
           >
              <div>
                 <div className="flex justify-between items-start mb-10">
                    <span className="px-4 py-1.5 bg-red-600 text-white text-[9px] font-bold tracking-widest rounded-full uppercase shadow-lg shadow-red-600/10">{car.category}</span>
                    <StatusBadge status={car.status} />
                 </div>
                 <div className="relative aspect-[16/10] mb-8 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center p-4 bg-slate-50 rounded-[2.5rem]">
                    <img src={car.image} alt={car.name} className="w-full h-full object-contain drop-shadow-xl" />
                 </div>
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 leading-none">Vehicle Name</p>
                 <h3 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{car.name}</h3>
              </div>

              <div className="space-y-5 pt-6 mt-6 border-t border-slate-50">
                 <div className="flex flex-wrap gap-2">
                    {(car.locations || []).slice(0, 3).map((loc, i) => (
                       <span key={i} className="text-[9px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">{loc.split(',')[0]}</span>
                    ))}
                 </div>
                 {/* Pricing info badges */}
                 <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                      <span className="material-symbols-outlined text-[13px]">speed</span>
                      {car.dailyKmLimit || 300} KM/day
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                      <span className="material-symbols-outlined text-[13px]">add_road</span>
                      ₹{car.extraKmCharge || 12}/km extra
                    </span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-900 p-5 rounded-[2rem] text-white">
                    <div>
                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none">Price / Day</p>
                       <p className="text-2xl font-bold tracking-tight">₹ {car.price}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-all">
                       <span className="material-symbols-outlined text-[20px]">edit</span>
                    </div>
                 </div>
              </div>
           </div>
        ))}
      </div>

      {/* Car Form Modal */}
      {(showAddCar || selectedCar) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] md:rounded-[3.5rem] shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="px-8 py-6 md:px-12 md:py-10 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{selectedCar ? 'Edit Vehicle' : 'Add Vehicle'}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-none tracking-tight">{selectedCar ? selectedCar.name : 'New Car.'}</h3>
                 </div>
                 <button onClick={closeModal} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              {/* Modal Form Body */}
              <div className="p-8 md:p-12 overflow-y-auto space-y-10">
                 <form className="space-y-10" onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Car Name</label>
                          <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30 uppercase tracking-widest" placeholder="e.g. SWIFT" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Category</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 cursor-pointer outline-none focus:border-red-600/30 uppercase tracking-widest" value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
                             <option value="">Select Category</option>
                             {categories.map(cat => <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>)}
                          </select>
                       </div>
                    </div>

                    {/* Branch Locations */}
                    <div className="space-y-4">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Available Branches</label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {locations.map((loc) => (
                             <label key={loc._id || loc.id} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${editData.locations?.includes(loc.name) ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}>
                                <input type="checkbox" className="w-5 h-5 rounded-lg text-red-600 border-slate-300 focus:ring-0" checked={editData.locations?.includes(loc.name)} onChange={() => handleLocationToggle(loc.name)} />
                                <span className="text-[11px] font-bold uppercase tracking-tight">{loc.name}</span>
                             </label>
                          ))}
                       </div>
                    </div>

                    {/* Pricing & Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Price / Day (₹)</label><input type="number" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30" value={editData.price} onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) || 0 })} /></div>
                       <div className="space-y-2"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Daily KM Limit</label><input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30" value={editData.dailyKmLimit} onChange={(e) => setEditData({ ...editData, dailyKmLimit: parseInt(e.target.value) || 300 })} /></div>
                       <div className="space-y-2"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Extra KM Charge (₹/km)</label><input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30" value={editData.extraKmCharge} onChange={(e) => setEditData({ ...editData, extraKmCharge: parseInt(e.target.value) || 12 })} /></div>
                       <div className="space-y-2"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Fuel Type</label><select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 uppercase tracking-widest outline-none focus:border-red-600/30" value={editData.specs?.fuel} onChange={(e) => setEditData({ ...editData, specs: { ...editData.specs, fuel: e.target.value }})}><option>Petrol</option><option>Diesel</option><option>Electric</option></select></div>
                    </div>

                    {/* Car Photo Upload */}
                    <div className="space-y-4">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Car Photo</label>
                       <div className="flex flex-col gap-4">
                          {editData.image && (
                            <div className="relative w-full h-48 bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 p-6 flex items-center justify-center">
                              <img src={editData.image} className="w-full h-full object-contain drop-shadow-xl" alt="Preview" />
                              <button type="button" onClick={() => setEditData({ ...editData, image: '' })} className="absolute top-4 right-4 w-12 h-12 bg-white/90 text-red-600 rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white transition-all"><span className="material-symbols-outlined">delete</span></button>
                            </div>
                          )}
                          <label className={`w-full h-36 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                             {uploading ? (
                                <div className="flex flex-col items-center gap-3">
                                   <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Uploading...</span>
                                </div>
                             ) : (
                                <>
                                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-slate-400 text-3xl">add_photo_alternate</span></div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editData.image ? 'Replace Photo' : 'Upload Photo'}</span>
                                   <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-widest">File: {editData.name ? `${editData.name.replace(/\s+/g, '-')}-1` : 'car-name-1'}</p>
                                </>
                             )}
                          </label>
                       </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 pt-6 sticky bottom-0 bg-white/90 backdrop-blur-md pb-4 md:pb-0 z-10">
                       <button type="submit" className="flex-1 py-6 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all">{selectedCar ? 'Save Changes' : 'Add Car'}</button>
                       {selectedCar && <button type="button" onClick={handleDelete} className="py-6 px-10 bg-red-50 text-red-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">Remove Car</button>}
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminFleet;
