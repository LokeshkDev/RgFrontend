import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-black pt-16 md:pt-24 pb-8 md:pb-12 px-6 md:px-12 relative overflow-hidden border-t border-red-900/10">
      <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-red-600 opacity-5 blur-[120px] pointer-events-none rounded-full"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 relative z-10">
        <div className="space-y-8">
          <Link to="/" className="flex items-center gap-4 group">
             <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg border border-red-500/20 group-hover:scale-110 transition-transform duration-500">RG</div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight uppercase leading-none">RG SELF DRIVING</h1>
                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">EST. 2017</p>
             </div>
          </Link>
          <p className="text-white/40 font-medium text-sm max-w-sm border-l-4 border-red-600 pl-6 leading-relaxed">
            Providing the freedom to drive your own journey since 2017. Based in Tirupur.
          </p>
        </div>

        <div className="space-y-8">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest opacity-40">Locations</h4>
          <div className="flex flex-col gap-4">
             {['Tirupur', 'Coimbatore', 'Erode', 'Salem'].map(loc => (
                <Link key={loc} to="/fleet" className="text-xs font-bold text-white/60 hover:text-red-500 transition-colors uppercase tracking-tight">{loc}</Link>
             ))}
          </div>
        </div>

        <div className="space-y-8">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest opacity-40">Useful Links</h4>
          <div className="flex flex-col gap-4">
             {[
               { name: 'Our Cars', path: '/fleet' },
               { name: 'About Us', path: '/about' },
               { name: 'Contact', path: '/contact' },
               { name: 'Car Attachment', path: '/about' }
             ].map(link => (
                <Link key={link.name} to={link.path} className="text-xs font-bold text-white/60 hover:text-red-500 transition-all hover:translate-x-1 duration-300 uppercase tracking-tight">{link.name}</Link>
             ))}
          </div>
        </div>

        <div className="space-y-8">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest opacity-40">Get in Touch</h4>
          <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
             <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Email Support</p>
             <p className="text-sm font-bold text-white">rgselfdrivingcars5@gmail.com</p>
             <Link to="/contact" className="block">
                <button className="w-full py-5 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-600/20">Contact Us</button>
             </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 md:mt-16 pt-8 md:pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
         <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">&copy; 2026 RG SELF DRIVING CARS. ALL RIGHTS RESERVED.</p>
         <div className="flex items-center gap-6">
            {['Instagram', 'Facebook', 'Twitter'].map(social => (
               <span key={social} className="text-[9px] font-bold text-white/20 uppercase tracking-widest hover:text-red-500 cursor-pointer transition-colors">{social}</span>
            ))}
         </div>
      </div>
    </footer>
  );
}

export default Footer;
