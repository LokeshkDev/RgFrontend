import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, selectedLocation, fetchLocations, logout } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Handle outside clicks for dropdown closing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync scroll for sections if on homepage or navigating
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
        navigate(`/#${id}`);
    } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFleetNavigation = () => {
    setMobileMenuOpen(false);
    navigate('/fleet');
  };

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Shield the click from global close
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black/90 backdrop-blur-xl border-b border-red-900/20 px-4 md:px-0">
        <div className="max-w-7xl mx-auto px-2 md:px-12 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-10">
             {/* Hamburger - Mobile only */}
             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:text-red-500 active:scale-95 transition-all"
             >
                <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
             </button>

             <Link to="/" className="flex items-center gap-3 md:gap-4 group active:scale-95 transition-transform duration-300">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-xl flex items-center justify-center font-bold text-white text-lg md:text-xl shadow-lg border border-red-500/20 group-hover:scale-105 transition-transform duration-500">
                   RG
                </div>
                <div className="hidden sm:block">
                   <h1 className="text-sm md:text-xl font-bold text-white leading-none tracking-tight uppercase">RG SELF DRIVING</h1>
                   <p className="text-[8px] md:text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">EST. 2017</p>
                </div>
             </Link>
             
             <div className="hidden md:flex items-center gap-8 pl-8 border-l border-white/10">
                <button onClick={handleFleetNavigation} className="text-xs font-bold text-white/60 hover:text-red-500 transition-colors uppercase tracking-wider">Our Cars</button>
                <button onClick={() => navigate('/about')} className="text-xs font-bold text-white/60 hover:text-red-500 transition-colors uppercase tracking-wider">About Us</button>
                <button onClick={() => navigate('/contact')} className="text-xs font-bold text-white/60 hover:text-red-500 transition-colors uppercase tracking-wider">Contact</button>
             </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
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
                <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={toggleDropdown}
                      className="flex items-center gap-3 p-1.5 md:p-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all shadow-xl group"
                    >
                       <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden group-hover:bg-red-500 transition-colors">
                          <span className="material-symbols-outlined text-xl">person</span>
                       </div>
                       <div className="hidden lg:block text-left text-white pr-2">
                          <p className="text-[9px] font-bold text-red-500 uppercase leading-none mb-1">Welcome</p>
                          <p className="text-xs font-bold">{user.name?.split(' ')[0]}</p>
                       </div>
                       <span className={`material-symbols-outlined text-white/40 text-sm hidden lg:block transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {/* Dropdown - Mobile App Feel */}
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-4 w-52 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-4 fade-in duration-300">
                          <div className="px-5 py-4 border-b border-white/5">
                              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                              <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          </div>
                          <div className="p-2 space-y-1">
                              {user.role === 'admin' && (
                                  <Link 
                                    to="/admin" 
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-red-600 rounded-2xl transition-all"
                                  >
                                      <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                      <span className="text-[11px] font-bold uppercase tracking-wider">Admin Center</span>
                                  </Link>
                              )}
                              <Link 
                                to="/account" 
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                              >
                                  <span className="material-symbols-outlined text-lg">account_circle</span>
                                  <span className="text-[11px] font-bold uppercase tracking-wider">My Account</span>
                              </Link>
                              <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-2xl transition-all"
                              >
                                  <span className="material-symbols-outlined text-lg text-slate-600">logout</span>
                                  <span className="text-[11px] font-bold uppercase tracking-widest">Sign Out</span>
                              </button>
                          </div>
                      </div>
                    )}
                </div>
              ) : (
                <Link to="/login">
                   <button className="px-5 md:px-8 py-3 md:py-4 bg-red-600 text-white rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 hover:bg-red-500 transition-all border border-red-400/20">Sign In</button>
                </Link>
              )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation - Outside Nav for correct fixed layering */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-black z-[999] overflow-y-auto outline-none border-t border-white/10 md:hidden">
            <div className="p-8 space-y-8">
                {/* Logout Button only if user is logged in */}
                {user && (
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-4 p-5 bg-red-600/10 rounded-[2rem] text-[11px] font-bold text-red-500 uppercase tracking-widest border border-red-500/20 active:bg-red-600 active:text-white transition-all shadow-xl">
                        <span className="material-symbols-outlined text-lg">logout</span> Sign Out Account
                    </button>
                )}

                <div className="grid grid-cols-1 gap-3">
                    <button onClick={handleFleetNavigation} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 active:scale-[0.98] transition-all group shadow-xl">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined text-2xl">directions_car</span>
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-[0.2em]">View Fleet</span>
                        </div>
                        <span className="material-symbols-outlined text-white/20">chevron_right</span>
                    </button>
                    <button onClick={() => { navigate('/about'); setMobileMenuOpen(false); }} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 active:scale-[0.98] transition-all shadow-xl">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/50">
                                <span className="material-symbols-outlined text-2xl">info</span>
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-[0.2em]">About RG</span>
                        </div>
                        <span className="material-symbols-outlined text-white/20">chevron_right</span>
                    </button>
                    <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 active:scale-[0.98] transition-all shadow-xl">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/50">
                                <span className="material-symbols-outlined text-2xl">call</span>
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-[0.2em]">Contact Us</span>
                        </div>
                        <span className="material-symbols-outlined text-white/20">chevron_right</span>
                    </button>
                </div>

                {!user && (
                    <div className="pt-6">
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                            <button className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(220,38,38,0.3)]">Join DriveFlex / Sign In</button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
      )}
    </>
  );
}

export default Header;
