import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

function Locations() {
  const navigate = useNavigate();
  const { setBookingLocation, selectedLocation, setDates } = useStore();
  
  const [selectedCity, setSelectedCity] = useState(selectedLocation);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');

  const locations = [
    { name: 'Indiranagar, Bangalore', address: '12th Main Rd, Bangalore' },
    { name: 'Koramangala, Bangalore', address: '80ft Rd, Bangalore' },
    { name: 'HSR Layout, Bangalore', address: '27th Main, Bangalore' },
    { name: 'MG Road, Bangalore', address: 'MG Road, Bangalore' },
    { name: 'Whitefield, Bangalore', address: 'ITPL Main Rd, Bangalore' },
  ];

  const handleProceed = () => {
    if (selectedCity && pickup && drop) {
      setBookingLocation(selectedCity, pickup, drop);
      navigate('/fleet');
    } else {
      alert('Please select location and dates');
    }
  };

  return (
    <div className="bg-slate-50 font-body min-h-screen pb-24">
      {/* Header */}
      <header className="p-8 bg-white/80 backdrop-blur-xl flex items-center justify-between shadow-sm sticky top-0 z-[100] border-b border-slate-100">
        <button onClick={() => navigate('/')} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all">
           <span className="material-symbols-outlined text-sm font-black text-primary">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
           <h1 className="text-xl font-black text-indigo-950 tracking-tighter leading-none uppercase">Location Hub.</h1>
           <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Select Delivery Node</p>
        </div>
        <div className="w-12"></div>
      </header>

      <main className="p-8 max-w-4xl mx-auto space-y-12 pt-12">
        {/* Date Selection Card */}
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border-b-8 border-slate-100 space-y-12">
           <h3 className="text-3xl font-black text-indigo-950 tracking-tighter border-l-8 border-primary pl-10 leading-none">Rental Window.</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] pl-3">Deployment Date</label>
                 <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm font-black text-indigo-950 focus:ring-4 focus:ring-primary/10 transition-all" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] pl-3">Retirement Date</label>
                 <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm font-black text-indigo-950 focus:ring-4 focus:ring-primary/10 transition-all" 
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                 />
              </div>
           </div>
        </div>

        {/* Location Selection Grid */}
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border-b-8 border-slate-100 space-y-12">
           <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-indigo-950 tracking-tighter border-l-8 border-secondary pl-10 leading-none">Identify Hub.</h3>
              <span className="text-[10px] font-black text-primary opacity-20 uppercase tracking-[0.4em]">Active Bangalore Nodes</span>
           </div>
           
           <div className="space-y-6">
              {locations.map((loc, idx) => (
                 <button 
                    key={idx}
                    onClick={() => setSelectedCity(loc.name)}
                    className={`w-full text-left p-8 rounded-[2.5rem] border-4 transition-all duration-500 flex items-center gap-8 ${selectedCity === loc.name ? 'border-primary bg-indigo-50/50 shadow-inner translate-x-4' : 'border-slate-50 hover:bg-slate-50 hover:translate-x-4'}`}
                 >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all ${selectedCity === loc.name ? 'bg-primary text-white scale-110' : 'bg-white text-slate-300 border border-slate-100'}`}>
                       <span className="material-symbols-outlined text-[24px]">pin_drop</span>
                    </div>
                    <div className="flex-1">
                       <p className="text-xl font-black text-indigo-950 tracking-tighter leading-none">{loc.name}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{loc.address}</p>
                    </div>
                    {selectedCity === loc.name && (
                       <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                          <span className="material-symbols-outlined text-sm font-black text-primary">check</span>
                       </div>
                    )}
                 </button>
              ))}
           </div>
        </div>

        {/* Action Panel */}
        <div className="fixed bottom-0 left-0 right-0 p-8 pt-4 bg-white/80 backdrop-blur-2xl border-t border-slate-100 flex items-center justify-between z-[110]">
           <div className="hidden md:block border-l-4 border-indigo-950 pl-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Target</p>
              <p className="font-black text-2xl text-primary tracking-tighter mt-1">{selectedCity || 'Awaiting Node Identification'}</p>
           </div>
           <button 
              onClick={handleProceed}
              disabled={!selectedCity || !pickup || !drop}
              className="w-full md:w-auto px-16 py-6 bg-primary text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.5em] disabled:opacity-20 shadow-[0_30px_60px_-15px_rgba(43,56,150,0.4)] transition-all hover:scale-105 active:scale-95"
           >
              INITIALIZE FLEET SEARCH
           </button>
        </div>
      </main>
      <div className="h-40"></div> {/* Spacer for fixed button */}
    </div>
  );
}

export default Locations;
