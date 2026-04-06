import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function About() {
  const stats = [
    { label: 'Instagram Followers', value: '17,000+' },
    { label: 'Regular Customers', value: '500+' },
    { label: 'Total Clients', value: '1000+' },
    { label: 'Years in Service', value: '8+' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-body overflow-x-hidden">
      <Header />
      
      {/* 1. Hero Section: Company History */}
      <section className="relative pt-48 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[100px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2"></div>
         
         <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
            <span className="px-6 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full inline-block shadow-lg">Established 2017</span>
            <h1 className="text-4xl md:text-8xl font-bold text-slate-900 tracking-tight leading-none">
               About <span className="text-red-600">RG Self Driving.</span>
            </h1>
            <p className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed max-w-2xl mx-auto">
               Founded in August 2017 by A. Richard George at the age of 19, RG Self Driving Cars is a trusted car rental service based in Tirupur.
            </p>
         </div>
      </section>

      {/* 2. Our Journey & Stats */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
               <div className="space-y-6">
                  <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight border-l-8 border-red-600 pl-6 md:pl-8">Our Journey.</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     What began as a small startup in Tirupur has today evolved into a trusted and fast-growing brand with a loyal customer base and a reputation built on transparency, service quality, and professionalism.
                  </p>
                  <p className="text-slate-500 font-medium leading-relaxed font-bold">
                     Our self-drive model allows people to travel comfortably at their own pace while enjoying complete privacy and flexibility. We provide the freedom to drive your own journey without drivers or time limits.
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, i) => (
                      <div key={i} className="p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl hover:border-red-600/20 transition-all duration-500">
                         <p className="text-2xl md:text-3xl font-bold text-red-600 mb-2">{stat.value}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      </div>
                  ))}
               </div>
            </div>

            <div className="relative">
               <div className="absolute -inset-4 bg-red-600/5 blur-[60px] rounded-full"></div>
               <div className="relative bg-black p-12 rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden group">
                  <div className="relative z-10 space-y-10">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-lg">“</div>
                        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight italic">Make Travel Memorable <br/>with Affordable Costs.</h3>
                     </div>
                     <div className="space-y-4">
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">Our Core Values</p>
                        <div className="grid grid-cols-1 gap-3">
                           {['Integrity & Honesty', 'Quality & Safety', 'Responsibility', 'Customer Commitment'].map(v => (
                              <div key={v} className="flex items-center gap-3 text-white/80 font-medium text-sm border-b border-white/5 pb-3 last:border-0 hover:translate-x-2 transition-transform duration-500">
                                 <span className="material-symbols-outlined text-red-600 text-lg">check_circle</span> {v}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. Vision & Mission Section */}
      <section className="py-24 px-6 bg-slate-900 border-y border-red-900/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <div className="space-y-6">
               <span className="text-red-600 font-bold text-xs uppercase tracking-widest opacity-60">Future Vision</span>
               <h3 className="text-4xl font-bold text-white tracking-tight">Our Vision.</h3>
               <p className="text-white/50 text-lg leading-relaxed font-medium">To be recognized as the most trusted self-driving car rental brand in Tamil Nadu, known for quality, safety, and customer-first service.</p>
            </div>
            <div className="space-y-6">
               <span className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-60">Daily Mission</span>
               <h3 className="text-4xl font-bold text-white tracking-tight">Our Mission.</h3>
               <div className="space-y-3">
                  {['Deliver dependable, clean, and comfortable cars', 'Maintain honest pricing and transparent operations', 'Strengthen relationships with car owners', 'Provide exceptional customer service'].map(m => (
                     <div key={m} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/80 font-medium text-xs flex items-center gap-3 hover:bg-white/10 transition-all">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> {m}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 4. Car Attachment Service (Simplified Collaboration) */}
      <section className="py-32 px-6 max-w-6xl mx-auto text-center space-y-16">
         <div className="space-y-4">
            <h4 className="text-red-600 font-bold text-xs uppercase tracking-widest">Earning Opportunity</h4>
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-none">Car Attachment <br/><span className="text-red-600">Service.</span></h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Earn guaranteed monthly income while we handle everything. Join 500+ car owners already successfully working within our network.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { icon: 'account_balance_wallet', title: 'Monthly Income', desc: 'Get stable and fixed monthly earnings for your car.' },
               { icon: 'engineering', title: 'Complete Management', desc: 'We handle verification, bookings, pickup, and maintenance.' },
               { icon: 'verified_user', title: 'Safe & Secure', desc: 'Started in 2017, we treat every vehicle with extreme care.' }
            ].map(opp => (
               <div key={opp.title} className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 space-y-6">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-500">
                     <span className="material-symbols-outlined text-3xl">{opp.icon}</span>
                  </div>
                  <h5 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{opp.title}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{opp.desc}</p>
               </div>
            ))}
         </div>

         <div className="pt-8">
            <button className="px-12 py-6 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 hover:bg-black transition-all duration-500">Contact for Car Attachment</button>
         </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
