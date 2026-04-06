import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useStore from '../store/useStore';

function Fleet() {
   const navigate = useNavigate();
   const {
      cars,
      selectedLocation,
      setLocation,
      locations,
      fetchLocations,
      selectCar,
      pickupDate,
      dropDate,
      fetchCars,
      categories,
      fetchCategories
   } = useStore();

   const [activeTab, setActiveTab] = useState('All');
   const [priceRange, setPriceRange] = useState(15000);
   const [vehicleTypes, setVehicleTypes] = useState([]);
   const [showFilters, setShowFilters] = useState(false);
   const [localLocation, setLocalLocation] = useState(selectedLocation);

   useEffect(() => {
      fetchCars();
      fetchCategories();
      fetchLocations();
   }, [fetchCars, fetchCategories, fetchLocations]);

   useEffect(() => {
      if (categories.length > 0 && vehicleTypes.length === 0) {
         setVehicleTypes(categories.map(c => c.name));
      }
   }, [categories]);

   const handleSelectCar = (car) => {
      selectCar(car);
      navigate('/booking');
   };

   const filteredCars = (cars || []).filter(car => {
      const matchesLocation = !localLocation || (car.locations || []).includes(localLocation);
      const matchesCategory = activeTab === 'All' || car.category === activeTab;
      const matchesPrice = car.price <= priceRange;
      const matchesType = vehicleTypes.length === 0 || vehicleTypes.includes(car.category);
      return matchesLocation && matchesCategory && matchesPrice && matchesType;
   });

   const toggleType = (type) => {
      if (vehicleTypes.includes(type)) {
         setVehicleTypes(vehicleTypes.filter(t => t !== type));
      } else {
         setVehicleTypes([...vehicleTypes, type]);
      }
   };

   // Check for required trip dates
   const isSearchValid = pickupDate && dropDate;

   return (
      <div className="min-h-screen bg-slate-50 font-body overflow-x-hidden relative selection:bg-red-500/20">
         <Header />

         {/* Navigation Guard: Date Selection Required */}
         {!isSearchValid && (
            <div className="fixed inset-0 z-[1000] bg-white/60 backdrop-blur-3xl flex items-center justify-center p-6 text-center animate-in fade-in duration-700">
               <div className="max-w-md w-full space-y-10 animate-in zoom-in-95 duration-700">
                  <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                     <span className="material-symbols-outlined text-5xl font-bold">calendar_month</span>
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Select Dates.</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Please choose your trip dates to see available cars</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4 text-xs font-medium text-slate-500">
                     <span className="material-symbols-outlined text-red-600 text-sm">info</span>
                     <p>We need your travel dates to confirm car availability.</p>
                  </div>
                  <Link 
                     to="/" 
                     className="block w-full py-6 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-black transition-all"
                  >
                     Go to Selection
                  </Link>
               </div>
            </div>
         )}

         {/* Fleet View Header */}
         <div className="pt-32 md:pt-40 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
               <div className="space-y-4">
                  <span className="px-5 py-2 bg-red-600/10 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">Our Collections</span>
                  <div className="space-y-1">
                     <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-none">Available Cars.</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Choose the perfect self-drive vehicle for your trip</p>
                  </div>
               </div>

               <div className="flex items-center gap-5 bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-red-600">
                     <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Current City</p>
                     <select 
                        className="text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
                        value={localLocation}
                        onChange={(e) => { setLocalLocation(e.target.value); setLocation(e.target.value); }}
                     >
                        <option value="">Select Location</option>
                        {locations.map(loc => (
                           <option key={loc._id || loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                     </select>
                  </div>
               </div>
            </div>
         </div>

         <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">

               {/* Filters Sidebar (Refined for Simplicity) */}
               <aside className="w-full lg:w-72 shrink-0 space-y-8">
                  <div className="p-6 md:p-8 bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
                     <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Filter Cars</h3>
                        <button onClick={() => { setVehicleTypes(categories.map(c => c.name)); setPriceRange(15000); }} className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline">Clear</button>
                     </div>

                     <div className="space-y-6">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Price per day</label>
                        <input type="range" min="1000" max="15000" step="500" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none accent-red-600 cursor-pointer" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} />
                        <div className="flex justify-between text-[11px] font-bold text-slate-900">
                           <span className="text-slate-300">₹1,000</span>
                           <span className="text-red-600">₹{priceRange.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Categories</label>
                        <div className="space-y-2">
                           {categories.map((cat) => (
                              <label key={cat._id || cat.id} className={`flex items-center gap-4 cursor-pointer p-4 rounded-2xl border transition-all ${vehicleTypes.includes(cat.name) ? 'bg-red-50 border-red-600/20' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                                 <input type="checkbox" checked={vehicleTypes.includes(cat.name)} onChange={() => toggleType(cat.name)} className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-slate-300" />
                                 <span className={`text-[10px] font-bold uppercase tracking-widest ${vehicleTypes.includes(cat.name) ? 'text-red-600' : 'text-slate-500'}`}>{cat.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                  </div>
               </aside>

               {/* Dashboard Grid */}
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                  {filteredCars.map((car) => (
                     <div 
                        key={car._id || car.id} 
                        className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col group h-full cursor-pointer" 
                        onClick={() => handleSelectCar(car)}
                     >
                        {/* Car Preview Area */}
                        <div className="w-full h-44 bg-slate-50 rounded-[2rem] overflow-hidden shrink-0 relative flex items-center justify-center p-8 group-hover:bg-red-50 transition-colors duration-500">
                           <img src={car.image} alt={car.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                           <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-white/80 backdrop-blur-md text-slate-900 text-[8px] font-bold uppercase tracking-widest rounded-full border border-slate-100">{car.category}</span>
                           </div>
                        </div>

                        <div className="flex-1 flex flex-col pt-8">
                           <div className="space-y-6 mb-8">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">{car.name}</h3>
                                 <div className="flex items-center gap-1.5 text-amber-500">
                                    <span className="material-symbols-outlined text-sm font-bold">star</span>
                                    <span className="text-[10px] font-bold text-slate-900 tracking-widest mt-0.5">4.9</span>
                                 </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                 {[
                                    { icon: 'local_gas_station', val: car.specs?.fuel || 'Petrol' },
                                    { icon: 'settings', val: car.specs?.transmission || 'Auto' },
                                    { icon: 'group', val: `${car.specs?.seats || '5'}` }
                                 ].map((spec, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                       <span className="material-symbols-outlined text-lg text-slate-300">{spec.icon}</span>
                                       <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{spec.val}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Per Day</span>
                                 <p className="text-2xl font-bold text-slate-900">₹{car.price}</p>
                              </div>
                              <button
                                 className="px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest group-hover:bg-red-600 transition-all shadow-xl group-hover:shadow-red-600/20"
                              >
                                 Book Car
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}

                  {filteredCars.length === 0 && (
                     <div className="py-24 px-10 text-center space-y-8 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 col-span-full">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-100"><span className="material-symbols-outlined text-6xl">search_off</span></div>
                        <div className="space-y-4">
                           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No available cars found matching your criteria.</p>
                           <button onClick={() => { setVehicleTypes(categories.map(c => c.name)); setPriceRange(15000); setLocalLocation(''); setLocation(''); }} className="px-10 py-5 bg-slate-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Reset All Filters</button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         <Footer />
      </div>
   );
}

export default Fleet;
