import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Contact() {
  const contactInfo = {
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    email: 'info@rgselfdrive.com',
    location: '123, Avinashi Road, Civil Aerodrome Post, Coimbatore, Tamil Nadu 641014'
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body overflow-x-hidden selection:bg-red-500/20">
      <Header />

      <main className="pt-32 md:pt-40 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center mb-16 space-y-5">
           <span className="px-5 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg inline-block shadow-lg">Contact Support</span>
           <h1 className="text-3xl md:text-7xl font-bold text-slate-900 tracking-tight leading-none">Get in Touch.</h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">We are here to help you with your journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
           {/* Contact cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                 { id: 'phone', label: 'Call Us', value: contactInfo.phone, icon: 'call', color: 'bg-indigo-50 text-indigo-600', link: `tel:${contactInfo.phone}` },
                 { id: 'whatsapp', label: 'WhatsApp', value: contactInfo.whatsapp, icon: 'chat', color: 'bg-green-50 text-green-600', link: `https://wa.me/${contactInfo.whatsapp.replace(/\s+/g, '')}` },
                 { id: 'email', label: 'Email', value: contactInfo.email, icon: 'mail', color: 'bg-red-50 text-red-600', link: `mailto:${contactInfo.email}` },
                 { id: 'branch', label: 'Main Office', value: 'Coimbatore, TN', icon: 'location_on', color: 'bg-slate-900 text-white', link: 'https://maps.google.com' }
              ].map(item => (
                 <a 
                   key={item.id} 
                   href={item.link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="bg-white p-6 py-10 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col items-center text-center space-y-6"
                 >
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ${item.color}`}>
                       <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">{item.label}</p>
                       <p className="text-lg font-bold text-slate-900 tracking-tight">{item.value}</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-red-600 transition-colors">Contact Support Hub</span>
                 </a>
              ))}
           </div>

           {/* physical location grid */}
           <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
              <div className="p-8 space-y-4">
                 <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Our Location.</h3>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{contactInfo.location}</p>
              </div>
              <div className="flex-1 min-h-[400px] w-full rounded-[2.5rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 border border-slate-50 relative">
                 <iframe 
                   title="RG Self Drive Location"
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125322.44173111453!2d76.88483285741002!3d11.01217032483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f973847%3A0x38270c707fd0d57a!2sCoimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1712330000000!5m2!1sen!2sin"
                   className="w-full h-full border-0"
                   allowFullScreen="" 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                 ></iframe>
                 <div className="absolute inset-0 pointer-events-none border-[12px] border-white rounded-[2.5rem]"></div>
              </div>
           </div>
        </div>

        {/* Support Section Refined */}
        <div className="bg-slate-900 p-10 md:p-24 rounded-[2.5rem] md:rounded-[3.5rem] text-center space-y-10 shadow-2shadow relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600 opacity-10 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500 opacity-10 blur-[100px] rounded-full"></div>
           
           <div className="space-y-6 relative z-10">
              <h2 className="text-3xl md:text-7xl font-bold text-white tracking-tight leading-none uppercase">Emergency Support.</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available 24/7 for roadside assistance and trip support</p>
           </div>
           
           <div className="relative z-10">
              <a href={`tel:${contactInfo.phone}`} className="inline-block px-14 py-7 bg-red-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-2xl shadow-red-600/20 hover:bg-white hover:text-black transition-all">Emergency Support</a>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
