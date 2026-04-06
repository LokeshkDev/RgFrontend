import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

const STATUS_STYLES = {
  Confirmed: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  Driving:   { bg: 'bg-red-50',  text: 'text-red-600',  dot: 'bg-red-500 animate-pulse' },
  Completed: { bg: 'bg-green-50',text: 'text-green-600',dot: 'bg-green-500' },
  Canceled:  { bg: 'bg-slate-100',text: 'text-slate-400',dot: 'bg-slate-300' },
  Pending:   { bg: 'bg-yellow-50',text: 'text-yellow-600',dot: 'bg-yellow-400' },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Confirmed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {status || 'Confirmed'}
    </span>
  );
}

function Account() {
  const navigate = useNavigate();
  const { user, bookings, fetchBookings, logout } = useStore();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [lightbox, setLightbox] = useState({ isOpen: false, photos: [], index: 0 });
  const [activeTab, setActiveTab] = useState('trips');
  const [settings, setSettings] = useState(null);
  const [copied, setCopied] = useState(false);

  const API_ROOT = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';


  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      const data = await res.json();
      console.log('Payment Settings:', data);
      setSettings(data);
    } catch (err) {
      console.error('Failed to load payment settings', err);
    }
  };

  const copyUPI = (upi) => {
    navigator.clipboard.writeText(upi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (user?.email) fetchBookings(user.email);
    fetchSettings();
  }, [user, fetchBookings]);

  if (!user) return null;

  const openLightbox = (photos, index) => setLightbox({ isOpen: true, photos, index });
  const nextPhoto = () => setLightbox(p => ({ ...p, index: (p.index + 1) % p.photos.length }));
  const prevPhoto = () => setLightbox(p => ({ ...p, index: (p.index - 1 + p.photos.length) % p.photos.length }));

  const completedTrips = bookings.filter(b => b.status === 'Completed').length;
  const activeTrip = bookings.find(b => b.status === 'Driving');

  const tabs = [
    { id: 'trips', label: 'My Trips', icon: 'directions_car' },
    { id: 'info', label: 'Profile', icon: 'person' },
    { id: 'policy', label: 'Policy', icon: 'policy' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-body overflow-x-hidden selection:bg-red-500/20 text-slate-900">
      <Header />

      <main className="pt-24 md:pt-32 pb-28 px-6 max-w-2xl mx-auto space-y-0 animate-in fade-in duration-700">

        {/* ── Profile Header Card ── */}
        <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 mb-6 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-56 h-56 bg-red-600 opacity-10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="flex items-center gap-5 mb-8 relative">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-red-600/30 uppercase shrink-0">
              {(user.name || 'U')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {user.role === 'admin' ? 'Administrator' : 'Verified Customer'}
              </p>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none truncate">{user.name}</h1>
              <p className="text-[10px] text-slate-400 font-bold mt-1 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-10 h-10 bg-white/10 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Trips', value: bookings.length, icon: 'receipt_long', color: 'text-white' },
              { label: 'Completed', value: completedTrips, icon: 'check_circle', color: 'text-green-400' },
              { label: 'Active Now', value: activeTrip ? 1 : 0, icon: 'directions_car', color: activeTrip ? 'text-red-400' : 'text-slate-500' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                <span className={`material-symbols-outlined text-[18px] ${stat.color}`}>{stat.icon}</span>
                <p className="text-xl font-bold text-white leading-none mt-1">{stat.value}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TRIPS TAB ── */}
        {activeTab === 'trips' && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 flex flex-col items-center gap-6 border border-dashed border-slate-200 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200">receipt_long</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No trips yet</p>
                <button
                  onClick={() => navigate('/fleet')}
                  className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-black transition-all"
                >
                  Book a Car
                </button>
              </div>
            ) : (
              bookings.map((booking) => (
                <button
                  key={booking._id || booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-red-600/10 transition-all duration-300 text-left overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Car image */}
                    <div className="w-20 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-2 shrink-0">
                      <img src={booking.car?.image} alt={booking.car?.name} className="w-full h-full object-contain" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate">{booking.car?.name}</h4>
                        <StatusPill status={booking.status} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 truncate">
                        {booking.pickupDate} → {booking.dropDate}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {booking.durationDays || 1} day{booking.durationDays > 1 ? 's' : ''}
                        </span>
                        {booking.tripDetails?.start?.vehicleNo && (
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{booking.tripDetails.start.vehicleNo}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount + Arrow */}
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-slate-900">₹{(booking.totalAmount || 0).toLocaleString()}</p>
                      <span className="material-symbols-outlined text-slate-200 text-[20px]">chevron_right</span>
                    </div>
                  </div>

                  {/* Trip charges if completed and not settled */}
                  {booking.status === 'Completed' && booking.tripDetails?.end && !booking.tripDetails.end.isSettled && (
                    ((booking.tripDetails.end.overKmCharge || 0) + (booking.tripDetails.end.lateCharge || 0) + (booking.tripDetails.end.extraCharge || 0)) > 0 && (
                      <div className="bg-red-50/50 border-t border-dashed border-slate-100">
                        <div className="px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex gap-2 flex-wrap">
                            {booking.tripDetails.end.overKmCharge > 0 && (
                              <span className="text-[8px] font-bold text-orange-600 bg-white border border-orange-100 px-2.5 py-1 rounded-lg uppercase tracking-tight">+₹{booking.tripDetails.end.overKmCharge} KM</span>
                            )}
                            {booking.tripDetails.end.lateCharge > 0 && (
                              <span className="text-[8px] font-bold text-red-600 bg-white border border-red-100 px-2.5 py-1 rounded-lg uppercase tracking-tight">+₹{booking.tripDetails.end.lateCharge} Late</span>
                            )}
                            {booking.tripDetails.end.extraCharge > 0 && (
                                <span className="text-[8px] font-bold text-slate-600 bg-white border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-tight">+₹{booking.tripDetails.end.extraCharge} Other</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                             <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Pending Settlement:</p>
                             <p className="text-sm font-bold text-red-600">₹{((booking.tripDetails.end.overKmCharge || 0) + (booking.tripDetails.end.lateCharge || 0) + (booking.tripDetails.end.extraCharge || 0)).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Payment Options (UPI/QR) */}
                        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                           {settings?.qrCode ? (
                              <div className="bg-white p-3 rounded-2xl border border-red-100 flex items-center gap-4">
                                 <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0 cursor-zoom-in" onClick={(e) => { e.stopPropagation(); openLightbox([API_ROOT + settings.qrCode], 0); }}>
                                    <img src={API_ROOT + settings.qrCode} className="w-full h-full object-contain p-1" alt="Payment QR" onError={(e) => e.target.src = 'https://placehold.co/100x100?text=No+QR'} />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-900 uppercase tracking-tight">Scan for Payment</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Settle your account</p>
                                 </div>
                              </div>
                           ) : (
                              <div className="bg-white p-4 rounded-2xl border border-dashed border-red-100 flex items-center justify-center">
                                 <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">QR Not Set By Admin</p>
                              </div>
                           )}

                           {settings?.upiId ? (
                              <div className="bg-white p-3 rounded-2xl border border-red-100 flex items-center justify-between gap-3 overflow-hidden">
                                 <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                                       <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                                    </div>
                                    <div className="min-w-0 pr-1">
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">UPI Details</p>
                                       <p className="text-[10px] font-bold text-slate-900 truncate">{settings.upiId}</p>
                                    </div>
                                 </div>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); copyUPI(settings.upiId); }}
                                    className={`px-4 py-2 shrink-0 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all ${copied ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-red-600'}`}
                                 >
                                    {copied ? 'Copied' : 'Copy'}
                                 </button>
                              </div>
                           ) : (
                              <div className="bg-white p-4 rounded-2xl border border-dashed border-red-100 flex items-center justify-center">
                                 <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">UPI ID Not Set</p>
                              </div>
                           )}
                        </div>
                      </div>
                    )
                  )}

                  {/* Trip charges if COMPLETED and ALREADY SETTLED */}
                  {booking.status === 'Completed' && booking.tripDetails?.end?.isSettled && (
                    <div className="bg-green-50 border-t border-green-100">
                      <div className="px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-col gap-1">
                           <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Payment Settled</p>
                           <div className="flex gap-2 flex-wrap mt-1">
                             <span className="text-[8px] font-bold text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-tight">Rental: ₹{booking.totalAmount?.toLocaleString() || '0'}</span>
                             {((booking.tripDetails.end.overKmCharge || 0) + (booking.tripDetails.end.lateCharge || 0) + (booking.tripDetails.end.extraCharge || 0)) > 0 && (
                               <span className="text-[8px] font-bold text-red-600 bg-white border border-red-100 px-2.5 py-1 rounded-lg uppercase tracking-tight">Extra: ₹{((booking.tripDetails.end.overKmCharge || 0) + (booking.tripDetails.end.lateCharge || 0) + (booking.tripDetails.end.extraCharge || 0)).toLocaleString()}</span>
                             )}
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Transaction Value</p>
                           <p className="text-lg font-bold text-green-600">₹{( (booking.totalAmount || 0) + (booking.tripDetails.end.overKmCharge || 0) + (booking.tripDetails.end.lateCharge || 0) + (booking.tripDetails.end.extraCharge || 0) ).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-none">Account Details</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Your registered information</p>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {[
                { label: 'Full Name', value: user.name, icon: 'badge' },
                { label: 'Email', value: user.email, icon: 'mail' },
                { label: 'Phone', value: user.phone || 'Not set', icon: 'phone' },
                { label: 'Account Type', value: user.role === 'admin' ? 'Administrator' : 'Customer', icon: 'verified_user' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-4 px-6 py-5">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">{row.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{row.label}</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-50">
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ── POLICY TAB ── */}
        {activeTab === 'policy' && (
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">policy</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-none">Rental Policy</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Charges & terms</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {[
                { icon: 'speed', color: 'bg-blue-50 text-blue-600', title: 'Daily KM Limit', desc: 'Each car has a set daily KM quota included in the rental. Excess KM is billed separately.' },
                { icon: 'add_road', color: 'bg-orange-50 text-orange-500', title: 'Extra KM Charge', desc: 'Driving beyond the daily limit is charged at ₹12/km (or per the rate set for your car).' },
                { icon: 'schedule', color: 'bg-red-50 text-red-500', title: 'Late Return Fee', desc: 'Returning the car after the agreed drop-off time will attract ₹150 for each hour of delay.' },
                { icon: 'currency_rupee', color: 'bg-green-50 text-green-600', title: 'Refundable Deposit', desc: '₹5,000 security deposit is collected at booking and refunded after a clean return inspection.' },
                { icon: 'local_gas_station', color: 'bg-purple-50 text-purple-500', title: 'Fuel Policy', desc: 'Vehicle must be returned with the same fuel level as at pickup. Low fuel may attract charges.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">{item.title}</p>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Booking Detail Bottom Sheet ── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white w-full md:max-w-lg md:rounded-[3rem] rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[90vh] overflow-hidden">
            
            {/* Sheet Handle + Header */}
            <div className="px-6 pt-3 pb-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-0.5">Trip Details</p>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{selectedBooking.car?.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={selectedBooking.status} />
                  <button onClick={() => setSelectedBooking(null)} className="w-9 h-9 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* Car Image */}
              <div className="bg-slate-50 rounded-3xl h-36 flex items-center justify-center p-4 border border-slate-100">
                <img src={selectedBooking.car?.image} alt={selectedBooking.car?.name} className="h-full object-contain drop-shadow-lg" />
              </div>

              {/* Booking ID + Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                  <p className="text-xs font-bold text-red-600 uppercase">#{String(selectedBooking._id || selectedBooking.id).slice(-8).toUpperCase()}</p>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-xl font-bold text-red-600 tracking-tight">₹{(selectedBooking.totalAmount || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-2 bg-slate-100 border-b border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Trip Schedule</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  {[
                    { label: 'Pickup', date: selectedBooking.pickupDate, time: selectedBooking.pickupTime, icon: 'location_on' },
                    { label: 'Return', date: selectedBooking.dropDate, time: selectedBooking.dropTime, icon: 'flag' },
                  ].map(s => (
                    <div key={s.label} className="p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-red-500 text-[14px]">{s.icon}</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{s.date}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{s.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                  <span className="text-sm font-bold text-slate-900">{selectedBooking.durationDays || 1} day{selectedBooking.durationDays > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Trip Start */}
              {selectedBooking.tripDetails?.start && (
                <div className="bg-blue-50 rounded-2xl border border-blue-100 overflow-hidden">
                  <div className="px-4 py-2 bg-blue-100/50 border-b border-blue-100">
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Trip Started</p>
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Start KM', value: `${(selectedBooking.tripDetails.start.km || 0).toLocaleString()} km` },
                      { label: 'Vehicle No', value: selectedBooking.tripDetails.start.vehicleNo || 'N/A' },
                      { label: 'Fuel Level', value: selectedBooking.tripDetails.start.petrolLevel || 'N/A' },
                    ].map(t => (
                      <div key={t.label} className="text-center">
                        <p className="text-[8px] font-bold text-blue-400 uppercase mb-1">{t.label}</p>
                        <p className="text-xs font-bold text-blue-900">{t.value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedBooking.tripDetails.start.photos?.length > 0 && (
                    <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
                      {selectedBooking.tripDetails.start.photos.map((p, i) => (
                        <div key={i} onClick={() => openLightbox(selectedBooking.tripDetails.start.photos.map(x => `${API_ROOT}${x}`), i)} className="shrink-0 w-20 h-14 rounded-xl overflow-hidden cursor-zoom-in border-2 border-white shadow-md">
                          <img src={`${API_ROOT}${p}`} className="w-full h-full object-cover" alt="Start photo" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Trip End + Charges */}
              {selectedBooking.tripDetails?.end && (
                <div className="bg-green-50 rounded-2xl border border-green-100 overflow-hidden">
                  <div className="px-4 py-2 bg-green-100/50 border-b border-green-100">
                    <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Trip Completed</p>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'End KM', value: `${(selectedBooking.tripDetails.end.km || 0).toLocaleString()} km` },
                      { label: 'Total Driven', value: `${selectedBooking.tripDetails.end.totalKm || 0} km` },
                      { label: 'Return Fuel', value: selectedBooking.tripDetails.end.petrolLevel || 'N/A' },
                      { label: 'Condition', value: selectedBooking.tripDetails.end.damageNote || 'No damage' },
                    ].map(t => (
                      <div key={t.label} className="bg-white rounded-xl p-3 border border-green-100">
                        <p className="text-[8px] font-bold text-green-400 uppercase mb-1">{t.label}</p>
                        <p className="text-xs font-bold text-green-900">{t.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charge summary */}
                  {(selectedBooking.tripDetails.end.overKmCharge > 0 || selectedBooking.tripDetails.end.lateCharge > 0) && (
                    <div className="mx-4 mb-4 bg-white rounded-xl border border-red-100 overflow-hidden">
                      <div className="px-4 py-2 bg-red-50 border-b border-red-100">
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Additional Charges</p>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {selectedBooking.tripDetails.end.overKm > 0 && (
                          <div className="flex justify-between px-4 py-3">
                            <p className="text-[10px] font-bold text-slate-500">Extra KM ({selectedBooking.tripDetails.end.overKm} km × ₹{selectedBooking.car?.extraKmCharge || 12})</p>
                            <p className="text-sm font-bold text-orange-600">₹{selectedBooking.tripDetails.end.overKmCharge || 0}</p>
                          </div>
                        )}
                        {selectedBooking.tripDetails.end.lateHours > 0 && (
                          <div className="flex justify-between px-4 py-3">
                            <p className="text-[10px] font-bold text-slate-500">Late Return ({selectedBooking.tripDetails.end.lateHours} hr × ₹150)</p>
                            <p className="text-sm font-bold text-red-600">₹{selectedBooking.tripDetails.end.lateCharge || 0}</p>
                          </div>
                        )}
                        <div className="flex justify-between px-4 py-3 bg-red-50">
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Total Extra</p>
                          <p className="text-base font-bold text-red-600">
                            ₹{((selectedBooking.tripDetails.end.overKmCharge || 0) + (selectedBooking.tripDetails.end.lateCharge || 0)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Extra Charges Policy Note */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">info</span>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Rental Rules</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-bold text-amber-600 bg-white px-3 py-1.5 rounded-full border border-amber-200">
                    {selectedBooking.car?.dailyKmLimit || 300} KM/day free
                  </span>
                  <span className="text-[9px] font-bold text-orange-600 bg-white px-3 py-1.5 rounded-full border border-orange-200">
                    ₹{selectedBooking.car?.extraKmCharge || 12}/km extra
                  </span>
                  <span className="text-[9px] font-bold text-red-600 bg-white px-3 py-1.5 rounded-full border border-red-200">
                    ₹150/hr late return
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100">
                <span className="material-symbols-outlined text-red-500 text-[20px]">location_on</span>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pickup Location</p>
                  <p className="text-sm font-bold text-slate-900">{selectedBooking.location}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 z-[6000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={() => setLightbox({ isOpen: false, photos: [], index: 0 })} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center z-50">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="relative w-full flex items-center justify-center group max-w-3xl">
            <button onClick={prevPhoto} className="absolute left-0 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl flex items-center justify-center z-50 transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <img src={lightbox.photos[lightbox.index]} className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl" alt="Trip photo" />
            <button onClick={nextPhoto} className="absolute right-0 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl flex items-center justify-center z-50 transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className="absolute bottom-6 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full text-white font-bold text-[10px] uppercase tracking-widest">
            {lightbox.index + 1} / {lightbox.photos.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Account;
