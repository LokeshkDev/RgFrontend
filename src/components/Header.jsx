import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

function Header() {
  const navigate = useNavigate();
  const { user, selectedLocation, fetchLocations } = useStore();

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleFleetNavigation = () => {
    navigate('/fleet');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    if (id === 'about') {
      navigate('/about');
      return;
    }
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[150] bg-black/90 backdrop-blur-xl border-b border-red-900/20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
        <div className="flex items-center gap-10">
           <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg border border-red-500/20 group-hover:scale-105 transition-transform duration-500">
                 RG
              </div>
              <div>
                 <h1 className="text-xl font-bold text-white leading-none tracking-tight uppercase">RG SELF DRIVING</h1>
                 <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">EST. 2017</p>
              </div>
           </Link>
           
           <div className="hidden md:flex items-center gap-8 pl-8 border-l border-white/10">
              <button onClick={handleFleetNavigation} className="text-xs font-bold text-white/60 hover:text-red-500 transition-colors uppercase tracking-wider">Our Cars</button>
              <button onClick={() => navigate('/about')} className="text-xs font-bold text-white/60 hover:text-red-500 transition-colors uppercase tracking-wider">About Us</button>
              <button onClick={() => navigate('/contact')} className="text-xs font-bold text-white/60 hover:text-red-500 transition-colors uppercase tracking-wider">Contact</button>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div 
              className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all" 
              onClick={handleFleetNavigation}
           >
              <span className="material-symbols-outlined text-red-500 text-sm">location_on</span>
              <div className="text-left">
                 <p className="text-[9px] font-bold text-white/40 uppercase">Selected Area</p>
                 <p className="text-xs font-bold text-white">{selectedLocation?.split(',')[0] || 'Tirupur'}</p>
              </div>
           </div>

            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/account'} className="flex items-center gap-3 group">
                 <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                    <span className="material-symbols-outlined text-xl">person</span>
                 </div>
                 <div className="hidden lg:block text-left text-white">
                    <p className="text-[9px] font-bold text-red-500 uppercase leading-none mb-1">Welcome</p>
                    <p className="text-xs font-bold">{user.name?.split(' ')[0]}</p>
                 </div>
              </Link>
            ) : (
              <Link to="/login">
                 <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 hover:scale-105 transition-all">Sign In</button>
              </Link>
            )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
