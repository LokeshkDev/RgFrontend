import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

function AdminLocations() {
  const { locations, fetchLocations, addLocation, updateLocation, deleteLocation } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', mapUrl: '' });

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (selectedLoc) {
      setFormData({ name: selectedLoc.name, address: selectedLoc.address, mapUrl: selectedLoc.mapUrl || '' });
    } else {
      setFormData({ name: '', address: '', mapUrl: '' });
    }
  }, [selectedLoc, showAddForm]);

  const handleSave = (e) => {
    e.preventDefault();
    if (selectedLoc) {
      updateLocation(selectedLoc._id || selectedLoc.id, formData);
    } else {
      addLocation(formData);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowAddForm(false);
    setSelectedLoc(null);
  };

  return (
    <AdminLayout activePage="locations">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2 animate-in fade-in duration-700">
        <div className="space-y-3">
          <span className="px-5 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl inline-block shadow-lg">Service Branches</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none">Locations.</h2>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="h-16 px-10 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all flex items-center gap-4 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-lg">add_location_alt</span>
          Add Branch
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-2 md:px-0 pb-20">
        {locations.map((loc) => (
          <div 
            key={loc._id || loc.id} 
            onClick={() => setSelectedLoc(loc)}
            className="group bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 hover:border-red-600/20 hover:shadow-2xl transition-all duration-700 cursor-pointer flex flex-col justify-between h-[380px]"
          >
             <div className="space-y-8">
                <div className="flex justify-between items-start">
                   <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-xl group-hover:bg-red-600 group-hover:scale-110 transition-all duration-500">
                      <span className="material-symbols-outlined text-3xl">location_on</span>
                   </div>
                   <span className="px-5 py-2 bg-green-50 text-[9px] font-bold text-green-600 border border-green-100 rounded-full uppercase tracking-widest">Active</span>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-4 leading-none">Branch Location</p>
                   <h3 className="text-4xl font-bold text-slate-900 leading-tight uppercase tracking-tight">{loc.name}</h3>
                   <div className="h-px w-20 bg-slate-100 my-6"></div>
                   <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest line-clamp-3 leading-loose">{loc.address}</p>
                </div>
             </div>
             <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Status: Live</span>
                <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                   <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {locations.length === 0 && (
         <div className="py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 mx-2 md:mx-0 flex flex-col items-center gap-10">
            <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200"><span className="material-symbols-outlined text-7xl font-thin">location_off</span></div>
            <div className="space-y-2">
               <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No branch locations added yet.</p>
               <p className="text-slate-200 text-[9px] uppercase tracking-widest">Click "Add Branch" to create your first location.</p>
            </div>
         </div>
      )}

      {/* Location Modal */}
      {(showAddForm || selectedLoc) && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
              {/* Modal Header */}
              <div className="px-10 py-10 md:px-14 md:py-12 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{selectedLoc ? 'Edit Location' : 'Add Location'}</p>
                    <h3 className="text-3xl font-bold text-slate-900 leading-none tracking-tight">{selectedLoc ? selectedLoc.name : 'New Branch.'}</h3>
                 </div>
                 <button onClick={closeModal} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined font-bold text-2xl">close</span>
                 </button>
              </div>

              {/* Modal Form */}
              <div className="p-10 md:p-14 overflow-y-auto space-y-10 scrollbar-hide">
                 <form className="space-y-10" onSubmit={handleSave}>
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Branch Name</label>
                       <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30 uppercase tracking-widest transition-all" placeholder="e.g. TIRUPUR MAIN" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Full Address</label>
                       <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30 h-36 tracking-tight transition-all" placeholder="Enter full branch address..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Google Maps Embed URL</label>
                       <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30 lowercase transition-all" placeholder="https://www.google.com/maps/embed?..." value={formData.mapUrl} onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                       <button type="submit" className="py-7 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all leading-none">{selectedLoc ? 'Save Changes' : 'Add Branch'}</button>
                       {selectedLoc && <button type="button" onClick={() => { if(window.confirm('Are you sure you want to delete this location?')) { deleteLocation(selectedLoc._id || selectedLoc.id); closeModal(); } }} className="py-7 px-8 bg-red-50 text-red-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm leading-none">Delete</button>}
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminLocations;
