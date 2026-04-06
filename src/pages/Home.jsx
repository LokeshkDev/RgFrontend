import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useStore from '../store/useStore';

function Home() {
  const navigate = useNavigate();
  const { 
    setLocation, 
    selectedLocation, 
    setDates,
    pickupDate: storePickupDate,
    pickupTime: storePickupTime,
    dropDate: storeDropDate,
    dropTime: storeDropTime,
    locations,
    fetchLocations
  } = useStore();
  
  const [searchState, setSearchState] = useState({
    location: selectedLocation || '',
    pickupDate: storePickupDate || '',
    pickupTime: storePickupTime || '10:00',
    dropDate: storeDropDate || '',
    dropTime: storeDropTime || '10:00'
  });

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (locations.length > 0 && !searchState.location) {
      setSearchState(prev => ({ ...prev, location: locations[0].name }));
    }
  }, [locations, searchState.location]);

  const handleSearchCars = () => {
    setLocation(searchState.location);
    setDates(searchState.pickupDate, searchState.pickupTime, searchState.dropDate, searchState.dropTime);
    navigate('/fleet');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-body overflow-x-hidden transition-all duration-700">
      <Header />
      
      {/* 1. Hero Banner: Affordable Rentals */}
      <section className="relative min-h-screen md:h-[90vh] flex items-start md:items-center justify-center overflow-hidden pt-32 md:pt-0">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover brightness-[0.2]" 
            alt="Self Drive Cars"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl px-6 animate-in fade-in duration-1000">
           <span className="px-6 py-2 bg-red-600/20 backdrop-blur-xl border border-red-500/30 text-red-500 text-[10px] font-bold uppercase tracking-[0.4em] rounded-full inline-block mb-8">Trusted Since 2017</span>
           <h1 className="text-4xl md:text-8xl font-bold text-white tracking-tight leading-none mb-8 md:mb-10">
              Drive yourself for <br/><span className="text-red-600 underline decoration-white/10">memorable trips.</span>
           </h1>
           
           {/* Booking Search Form */}
           <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-1000 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2 text-left md:border-r border-slate-100 md:pr-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm text-red-600">location_on</span> Choose Location
                    </p>
                    <select 
                       value={searchState.location}
                       onChange={(e) => setSearchState({...searchState, location: e.target.value})}
                       className="w-full bg-slate-50 border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500/10 cursor-pointer transition-all"
                    >
                       {locations.map(loc => <option key={loc._id || loc.id} value={loc.name}>{loc.name}</option>)}
                       {locations.length === 0 && <option>No locations available</option>}
                    </select>
                 </div>

                 <div className="space-y-2 text-left md:border-r border-slate-100 md:pr-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm text-red-600">event</span> Pickup Date & Time
                    </p>
                    <div className="flex gap-2">
                       <input type="date" required className="flex-1 bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-900" value={searchState.pickupDate} onChange={e => setSearchState({...searchState, pickupDate: e.target.value})} />
                       <input type="time" required className="w-24 bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-900" value={searchState.pickupTime} onChange={e => setSearchState({...searchState, pickupTime: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-2 text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm text-red-600">event_available</span> Drop Date & Time
                    </p>
                    <div className="flex gap-2">
                       <input type="date" required className="flex-1 bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-900" value={searchState.dropDate} onChange={e => setSearchState({...searchState, dropDate: e.target.value})} />
                       <input type="time" required className="w-24 bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-900" value={searchState.dropTime} onChange={e => setSearchState({...searchState, dropTime: e.target.value})} />
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleSearchCars}
                className="w-full py-5 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-600/30 hover:bg-red-500 hover:scale-[1.01] active:scale-95 transition-all"
              >
                Find Available Cars
              </button>
           </div>
        </div>
      </section>

      {/* 2. Car Attachment Service (Redone from Promotion) */}
      <section className="py-12 md:py-24 px-6">
         <div className="max-w-7xl mx-auto rounded-[3rem] overflow-hidden relative min-h-[500px] flex items-center shadow-2xl border border-slate-100">
            <img 
               src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop" 
               className="absolute inset-0 w-full h-full object-cover brightness-[0.3]" 
               alt="Car Attachment Service"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
            <div className="relative z-10 p-12 md:p-20 space-y-8 max-w-3xl">
               <span className="text-red-500 font-bold text-[12px] uppercase tracking-widest">Earning Opportunity</span>
               <h3 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">Car Attachment <br/>Service.</h3>
               <p className="text-white/70 font-medium text-lg leading-relaxed max-w-xl">Earn guaranteed monthly income by attaching your car with us. We handle everything from bookings to maintenance.</p>
               <button onClick={() => navigate('/about')} className="px-10 py-5 bg-red-600 text-white rounded-3xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-red-600/30">Learn More About Attachment</button>
            </div>
         </div>
      </section>

      {/* 3. Simple FAQ Section */}
      <section id="faq-section" className="py-12 md:py-24 px-6 bg-slate-50/50">
         <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">Common Questions.</h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Simple things to know</p>
            </div>

            <div className="space-y-4">
               {[
                  { q: 'What do I need to book a car?', a: 'You need a valid Driving License and an Identity Proof (Aadhar or Voter ID). Upload them during booking and you are good to go.' },
                  { q: 'Is there a security deposit?', a: 'Yes, a standard ₹5,000 refundable deposit is required for all bookings to ensure car safety. It will be returned after your trip.' },
                  { q: 'Can I pick up the car from a different city?', a: 'We currently operate in Tirupur and nearby areas. Please check our dynamic location list in the search bar for the latest update.' }
               ].map((faq, i) => (
                  <details key={i} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all shadow-sm">
                     <summary className="p-6 md:p-8 cursor-pointer list-none flex justify-between items-center gap-4 hover:bg-slate-50/50">
                        <span className="text-base md:text-lg font-bold text-slate-900 flex-1">{faq.q}</span>
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-red-600 group-open:rotate-180 transition-transform shrink-0">
                           <span className="material-symbols-outlined text-xl">expand_more</span>
                        </div>
                     </summary>
                     <div className="px-8 pb-8">
                        <p className="text-slate-500 font-medium text-sm leading-relaxed border-t border-slate-50 pt-6">{faq.a}</p>
                     </div>
                  </details>
               ))}
            </div>
         </div>
      </section>

      {/* 4. Final CTA */}
      <section className="py-12 md:py-24 px-6">
         <div className="max-w-7xl mx-auto bg-black rounded-[3rem] p-10 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl border border-red-900/20">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600 opacity-10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
            <div className="space-y-6 relative z-10">
               <h2 className="text-4xl md:text-8xl font-bold text-white tracking-tight leading-none uppercase">Ready to drive?</h2>
               <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Book your car in Tirupur today at affordable prices.</p>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-6 relative z-10">
               <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="px-16 py-6 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-white hover:text-black transition-all">Start Booking</button>
               <button className="px-16 py-6 border-2 border-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Contact Support</button>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
