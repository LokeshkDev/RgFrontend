import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import useStore from '../store/useStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_ROOT = API_BASE.replace('/api', '');

function AdminBookings() {
  const { bookings, fetchBookings, cars } = useStore();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [tripForm, setTripForm] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [lightbox, setLightbox] = useState({ isOpen: false, photos: [], index: 0 });
  const [filterStatus, setFilterStatus] = useState('All');

  const [startData, setStartData] = useState({ km: '', vehicleNo: '', petrolLevel: 'Full', tempFiles: null });
  const [endData, setEndData] = useState({ km: '', petrolLevel: 'Full', damageNote: '', tempFiles: null, extraCharge: 0, dropDate: new Date().toISOString().split('T')[0], dropTime: new Date().toTimeString().slice(0,5) });
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  React.useEffect(() => {
    if (selectedBooking || tripForm || editForm || lightbox.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedBooking, tripForm, editForm, lightbox.isOpen]);

  const StatusBadge = ({ status }) => {
    const styles = {
      'Confirmed': 'bg-blue-50 text-blue-600 border-blue-100',
      'Driving': 'bg-red-50 text-red-600 border-red-100 animate-pulse',
      'Completed': 'bg-green-50 text-green-600 border-green-100',
      'Canceled': 'bg-slate-50 text-slate-400 border-slate-100',
    };
    return <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${styles[status] || 'bg-slate-100'}`}>{status}</span>;
  };

  const openLightbox = (photos, index) => setLightbox({ isOpen: true, photos, index });
  const nextPhoto = () => setLightbox(p => ({ ...p, index: (p.index + 1) % p.photos.length }));
  const prevPhoto = () => setLightbox(p => ({ ...p, index: (p.index - 1 + p.photos.length) % p.photos.length }));

  const handlePhotoUpload = async (files) => {
    if (!files || files.length === 0) return [];
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('tripPhotos', file));
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setUploading(false);
      return data.tripPhotos || [];
    } catch (err) { setUploading(false); return []; }
  };

  const calculateOverage = (booking, currentKm, manualDropDate, manualDropTime) => {
    const startKm = booking.tripDetails?.start?.km || 0;
    const totalKm = Number(currentKm) - startKm;
    
    const kmLimitPerDay = booking.car?.dailyKmLimit || 300;
    const extraKmRate = booking.car?.extraKmCharge || 12;
    const lateRatePerHour = 150;
    const limit = (booking.durationDays || 1) * kmLimitPerDay;
    const overKm = Math.max(0, totalKm - limit);
    const overKmCharge = overKm * extraKmRate;

    // Standard ISO-friendly parsing
    const scheduledEnd = new Date(`${booking.dropDate}T${booking.dropTime}`);
    const actualEnd = (manualDropDate && manualDropTime) 
      ? new Date(`${manualDropDate}T${manualDropTime}`) 
      : new Date();
    
    const diffMs = actualEnd.getTime() - scheduledEnd.getTime();
    const lateHours = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60)) : 0;
    const lateCharge = lateHours * lateRatePerHour;

    console.log('--- LATE FEE LOG ---');
    console.log('Scheduled End:', scheduledEnd.toLocaleString());
    console.log('Actual End:', actualEnd.toLocaleString());
    console.log('Late Hours:', lateHours);
    
    return { totalKm, limit, kmLimitPerDay, extraKmRate, overKm, overKmCharge, lateHours, lateCharge };
  };

  const startTrip = async () => {
    const b = tripForm.booking;
    if (!startData.km || !startData.vehicleNo) return alert('Enter Odometer KM and Vehicle Number.');
    const photos = await handlePhotoUpload(startData.tempFiles);
    try {
      await fetch(`${API_BASE}/bookings/${b._id || b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Driving',
          tripDetails: { ...b.tripDetails, start: { km: Number(startData.km), vehicleNo: startData.vehicleNo, petrolLevel: startData.petrolLevel, photos, timestamp: new Date() } }
        })
      });
      fetchBookings(); setTripForm(null); setSelectedBooking(null);
    } catch { alert('Failed to start trip.'); }
  };

  const endTrip = async () => {
    const b = tripForm.booking;
    if (!endData.km) return alert('Enter return odometer KM.');
    if (!endData.dropDate || !endData.dropTime) return alert('Enter return date/time.');
    const photos = await handlePhotoUpload(endData.tempFiles);
    const { totalKm, overKm, overKmCharge, lateHours, lateCharge } = calculateOverage(b, endData.km, endData.dropDate, endData.dropTime);
    try {
      await fetch(`${API_BASE}/bookings/${b._id || b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          tripDetails: { ...b.tripDetails, end: { km: Number(endData.km), totalKm, overKm, overKmCharge, lateHours, lateCharge, extraCharge: Number(endData.extraCharge || 0), petrolLevel: endData.petrolLevel, damageNote: endData.damageNote, photos, timestamp: new Date(`${endData.dropDate}T${endData.dropTime}`) } }
        })
      });
      fetchBookings(); setTripForm(null); setSelectedBooking(null);
    } catch { alert('Failed to end trip.'); }
  };

  const handleEditSubmission = async () => {
    try {
       await fetch(`${API_BASE}/bookings/${editForm._id || editForm.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm)
       });
       fetchBookings(); setEditForm(null); setSelectedBooking(null);
       alert('Booking updated.');
    } catch { alert('Failed to update.'); }
  };

  const deleteBooking = async (id) => {
    if (window.confirm('Delete this booking permanently?')) {
       await fetch(`${API_BASE}/bookings/${id}`, { method: 'DELETE' });
       fetchBookings(); setSelectedBooking(null);
    }
  };

  const toggleSettlement = async (booking) => {
    const isSettled = !booking.tripDetails?.end?.isSettled;
    try {
      await fetch(`${API_BASE}/bookings/${booking._id || booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           'tripDetails.end.isSettled': isSettled 
        })
      });
      fetchBookings();
      // Also update selected booking locally
      setSelectedBooking({
         ...booking,
         tripDetails: {
            ...booking.tripDetails,
            end: { ...booking.tripDetails.end, isSettled }
         }
      });
    } catch (err) {
      alert('Failed to update settlement status.');
    }
  };

  const filteredBookings = filterStatus === 'All' ? bookings : bookings.filter(b => b.status === filterStatus);

  return (
    <AdminLayout activePage="bookings">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Management</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-none">Bookings.</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">{bookings.length} Total</span>
        </div>
      </div>

      {/* ── Status Filter Pills (App-Style) ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Confirmed', 'Driving', 'Completed', 'Canceled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all border ${
              filterStatus === status
                ? status === 'Driving' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                  : 'bg-slate-900 text-white border-slate-900 shadow-lg'
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID</th>
                <th className="px-6 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customer</th>
                <th className="px-6 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Car</th>
                <th className="px-6 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-6 text-[10px] text-red-400 font-bold uppercase tracking-widest text-center">Pending Extra</th>
                <th className="px-8 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">Actions</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
             {filteredBookings.map((booking) => (
                <tr key={booking._id || booking.id} className="hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-red-600">
                   <td className="px-8 py-7 text-[10px] font-bold text-slate-300 uppercase">#{String(booking._id || booking.id).slice(-8).toUpperCase()}</td>
                   <td className="px-6 py-7">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-xl font-bold text-sm uppercase">{(booking.userData?.name || 'U')[0]}</div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{booking.userData?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wide">{booking.userData?.phone}</p>
                         </div>
                      </div>
                   </td>
                   <td className="px-6 py-7">
                      <div>
                         <p className="text-sm font-bold text-slate-900 leading-none">{booking.car?.name}</p>
                         <p className="text-[10px] text-red-600 font-bold mt-1 uppercase">{booking.location?.split(',')[0]}</p>
                      </div>
                   </td>
                   <td className="px-6 py-7 text-center"><StatusBadge status={booking.status || 'Confirmed'} /></td>
                   <td className="px-6 py-7 text-center">
                     {booking.status === 'Completed' && (booking.tripDetails?.end?.overKmCharge > 0 || booking.tripDetails?.end?.lateCharge > 0 || booking.tripDetails?.end?.extraCharge > 0) ? (
                        <span className="text-sm font-bold text-red-600">₹{((booking.tripDetails.end.overKmCharge || 0) + (booking.tripDetails.end.lateCharge || 0) + (booking.tripDetails.end.extraCharge || 0)).toLocaleString()}</span>
                     ) : (
                        <span className="text-[10px] font-bold text-slate-200">₹0</span>
                     )}
                   </td>
                   <td className="px-8 py-7 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button onClick={() => setSelectedBooking(booking)} className="w-10 h-10 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><span className="material-symbols-outlined text-[16px]">visibility</span></button>
                         <button onClick={() => setEditForm(JSON.parse(JSON.stringify(booking)))} className="w-10 h-10 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                         {booking.status === 'Confirmed' && <button onClick={() => setTripForm({ type: 'start', booking })} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider shadow-md">Start</button>}
                         {booking.status === 'Driving' && <button onClick={() => setTripForm({ type: 'end', booking })} className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider shadow-md">End</button>}
                      </div>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card List (App Style) ── */}
      <div className="md:hidden space-y-3 pb-4">
        {filteredBookings.map((booking) => (
          <div
            key={booking._id || booking.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* Card Top — clickable info area */}
            <button
              className="w-full text-left px-5 py-4 flex items-center gap-4"
              onClick={() => setSelectedBooking(booking)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center rounded-2xl font-bold text-lg uppercase shrink-0">
                {(booking.userData?.name || 'U')[0]}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{booking.userData?.name}</p>
                  <StatusBadge status={booking.status || 'Confirmed'} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 truncate">{booking.car?.name} · {booking.location?.split(',')[0]}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">#{String(booking._id || booking.id).slice(-6).toUpperCase()} · Paid: ₹{(booking.totalAmount || 0).toLocaleString()}</p>
                {booking.status === 'Completed' && ((booking.tripDetails?.end?.overKmCharge || 0) + (booking.tripDetails?.end?.lateCharge || 0) + (booking.tripDetails?.end?.extraCharge || 0)) > 0 && (
                   <div className="mt-2 flex items-center gap-1.5 animate-in slide-in-from-left duration-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Extra Due: ₹{((booking.tripDetails.end.overKmCharge || 0) + (booking.tripDetails.end.lateCharge || 0) + (booking.tripDetails.end.extraCharge || 0)).toLocaleString()}</p>
                   </div>
                )}
              </div>
              <span className="material-symbols-outlined text-slate-200 shrink-0">chevron_right</span>
            </button>

            {/* Card Bottom — Action Buttons */}
            <div className="px-4 pb-4 flex items-center gap-2 border-t border-slate-50 pt-3">
              {/* View */}
              <button
                onClick={() => setSelectedBooking(booking)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
              >
                <span className="material-symbols-outlined text-[15px]">visibility</span>
                View
              </button>
              {/* Edit */}
              <button
                onClick={() => setEditForm(JSON.parse(JSON.stringify(booking)))}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                Edit
              </button>
              {/* Start Trip */}
              {booking.status === 'Confirmed' && (
                <button
                  onClick={() => setTripForm({ type: 'start', booking })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest shadow-md shadow-blue-600/20"
                >
                  <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                  Start
                </button>
              )}
              {/* End Trip */}
              {booking.status === 'Driving' && (
                <button
                  onClick={() => setTripForm({ type: 'end', booking })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest shadow-md shadow-red-600/20 animate-pulse"
                >
                  <span className="material-symbols-outlined text-[15px]">stop_circle</span>
                  End
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4">calendar_today</span>
            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">No bookings found.</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          BOOKING DETAIL MODAL
      ══════════════════════════════════════ */}
      {selectedBooking && !tripForm && !editForm && (
        <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-300">
           {/* Sheet on mobile, centered on desktop */}
           <div className="bg-white w-full md:max-w-5xl md:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl relative animate-in slide-in-from-bottom md:zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[92vh] md:mx-6">
              {/* Header */}
              <div className="px-6 py-5 md:px-12 md:py-10 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
                 <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Booking Detail</p>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">#{String(selectedBooking._id || selectedBooking.id).slice(-8).toUpperCase()}</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setEditForm(JSON.parse(JSON.stringify(selectedBooking)))} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                       <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => setSelectedBooking(null)} className="w-10 h-10 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                       <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scrollbar-hide">

                {/* Quick Status + Trip Actions */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-5 border border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold">{(selectedBooking.userData?.name || 'U')[0]}</div>
                      <div>
                         <p className="font-bold text-slate-900 text-base leading-none">{selectedBooking.userData?.name}</p>
                         <p className="text-[11px] font-bold text-slate-400 mt-1">{selectedBooking.userData?.phone}</p>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2 items-end">
                      <StatusBadge status={selectedBooking.status || 'Confirmed'} />
                      {selectedBooking.status === 'Confirmed' && (
                        <button onClick={() => setTripForm({ type: 'start', booking: selectedBooking })} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-md">Start Trip</button>
                      )}
                      {selectedBooking.status === 'Driving' && (
                        <button onClick={() => setTripForm({ type: 'end', booking: selectedBooking })} className="px-5 py-2 bg-red-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-md animate-pulse">End Trip</button>
                      )}
                   </div>
                </div>

                {/* Car + Location + Billing */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vehicle</p>
                      <img src={selectedBooking.car?.image} alt="" className="w-full h-24 object-contain mb-3" />
                      <p className="text-sm font-bold text-slate-900 uppercase">{selectedBooking.car?.name}</p>
                   </div>
                   <div className="space-y-3">
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</p>
                         <p className="text-sm font-bold text-slate-900">{selectedBooking.location}</p>
                      </div>
                      <div className="bg-slate-900 rounded-2xl p-5 text-white">
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                         <p className="text-3xl font-bold text-red-600 tracking-tight">₹{selectedBooking.totalAmount}</p>
                      </div>
                   </div>
                </div>

                {/* Schedule */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Schedule</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <p className="text-[9px] text-slate-400 uppercase mb-1 font-bold">Pickup</p>
                         <p className="font-bold text-slate-900 text-sm">{selectedBooking.pickupDate}</p>
                         <p className="text-[10px] text-slate-400 font-bold">{selectedBooking.pickupTime}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] text-slate-400 uppercase mb-1 font-bold">Return</p>
                         <p className="font-bold text-slate-900 text-sm">{selectedBooking.dropDate}</p>
                         <p className="text-[10px] text-slate-400 font-bold">{selectedBooking.dropTime}</p>
                      </div>
                   </div>
                </div>

                {/* ID Documents */}
                <div className="space-y-3">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identity Documents</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => openLightbox([`${ASSET_ROOT}${selectedBooking.docs?.license}`, `${ASSET_ROOT}${selectedBooking.docs?.identityProof}`], 0)} className="cursor-zoom-in bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden h-32 flex flex-col">
                         <img src={`${ASSET_ROOT}${selectedBooking.docs?.license}`} className="flex-1 w-full object-contain p-2" alt="License" />
                         <p className="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest py-2">License</p>
                      </div>
                      <div onClick={() => openLightbox([`${ASSET_ROOT}${selectedBooking.docs?.license}`, `${ASSET_ROOT}${selectedBooking.docs?.identityProof}`], 1)} className="cursor-zoom-in bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden h-32 flex flex-col">
                         <img src={`${ASSET_ROOT}${selectedBooking.docs?.identityProof}`} className="flex-1 w-full object-contain p-2" alt="ID" />
                         <p className="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest py-2">ID Proof</p>
                      </div>
                   </div>
                </div>

                {/* Trip Start Data */}
                {selectedBooking.tripDetails?.start && (
                   <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Trip Start Info</p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                         <div className="bg-white rounded-xl p-3 border border-slate-100">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">KM</p>
                            <p className="text-xl font-bold text-slate-900">{(selectedBooking.tripDetails.start.km || 0).toLocaleString()}</p>
                         </div>
                         <div className="bg-white rounded-xl p-3 border border-slate-100">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Fuel</p>
                            <p className="text-sm font-bold text-red-600">{selectedBooking.tripDetails.start.petrolLevel || 'Full'}</p>
                         </div>
                         <div className="bg-white rounded-xl p-3 border border-slate-100">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Plate</p>
                            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{selectedBooking.tripDetails.start.vehicleNo || 'N/A'}</p>
                         </div>
                      </div>
                      {selectedBooking.tripDetails.start.photos?.length > 0 && (
                         <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                            {selectedBooking.tripDetails.start.photos.map((p, i) => (
                               <div key={i} onClick={() => openLightbox(selectedBooking.tripDetails.start.photos.map(x => `${ASSET_ROOT}${x}`), i)} className="shrink-0 h-24 w-36 rounded-2xl overflow-hidden border border-slate-100 cursor-zoom-in shadow-sm">
                                  <img src={`${ASSET_ROOT}${p}`} className="w-full h-full object-cover" alt="Start" />
                               </div>
                            ))}
                         </div>
                      )}
                   </div>
                )}

                {/* Trip End Data */}
                {selectedBooking.tripDetails?.end && (
                   <div className="bg-green-50 rounded-2xl p-5 border border-green-100 space-y-4">
                      <p className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Trip End Summary</p>

                      {/* Odometer + KM row */}
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white rounded-xl p-4 border border-green-100">
                            <p className="text-[8px] font-bold text-green-400 uppercase mb-1">End Odometer</p>
                            <p className="text-xl font-bold text-green-900">{(selectedBooking.tripDetails.end.km || 0).toLocaleString()} <span className="text-xs text-green-300 font-normal">km</span></p>
                         </div>
                         <div className="bg-white rounded-xl p-4 border border-green-100">
                            <p className="text-[8px] font-bold text-green-400 uppercase mb-1">Total Driven</p>
                            <p className="text-xl font-bold text-green-700">+{selectedBooking.tripDetails.end.totalKm || 0} <span className="text-xs text-green-300 font-normal">km</span></p>
                         </div>
                      </div>

                      {/* Charges breakdown */}
                      <div className="bg-white rounded-xl border border-green-100 overflow-hidden">
                         <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                            <p className="text-[8px] font-bold text-green-400 uppercase tracking-widest">Charge Breakdown</p>
                         </div>
                         <div className="divide-y divide-slate-50">
                            {[
                              { label: 'Extra KM Beyond Limit', value: `${selectedBooking.tripDetails.end.overKm || 0} KM`, highlight: (selectedBooking.tripDetails.end.overKm || 0) > 0 },
                              { label: `Extra KM Charge (₹${selectedBooking.car?.extraKmCharge || 12}/km)`, value: `₹${(selectedBooking.tripDetails.end.overKmCharge || 0).toLocaleString()}`, highlight: (selectedBooking.tripDetails.end.overKmCharge || 0) > 0 },
                              { label: `Late Return (${selectedBooking.tripDetails.end.lateHours || 0} hrs × ₹150)`, value: `₹${(selectedBooking.tripDetails.end.lateCharge || 0).toLocaleString()}`, highlight: (selectedBooking.tripDetails.end.lateHours || 0) > 0 },
                              { label: 'Manual Adjustment', value: `₹${(selectedBooking.tripDetails.end.extraCharge || 0).toLocaleString()}` },
                            ].map(row => (
                              <div key={row.label} className="flex justify-between items-center px-4 py-3">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-none">{row.label}</span>
                                 <span className={`text-sm font-bold ${row.highlight ? 'text-red-600' : 'text-slate-400'}`}>{row.value}</span>
                              </div>
                            ))}
                            {/* Total Extra */}
                            <div className="flex justify-between items-center px-4 py-3 bg-red-50 border-t border-red-100">
                               <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Total Extra Charges</span>
                               <span className="text-lg font-bold text-red-600">
                                  ₹{((selectedBooking.tripDetails.end.overKmCharge || 0) + (selectedBooking.tripDetails.end.lateCharge || 0) + (selectedBooking.tripDetails.end.extraCharge || 0)).toLocaleString()}
                               </span>
                            </div>
                         </div>
                      </div>

                      {/* Fuel Level */}
                      <div className="flex gap-3">
                         <div className="flex-1 bg-white rounded-xl p-3 border border-green-100 text-center">
                            <p className="text-[8px] font-bold text-green-400 uppercase mb-1">Return Fuel</p>
                            <p className="text-sm font-bold text-green-900">{selectedBooking.tripDetails.end.petrolLevel || 'N/A'}</p>
                         </div>
                         {selectedBooking.tripDetails.end.damageNote && (
                           <div className="flex-1 bg-white rounded-xl p-3 border border-orange-100">
                              <p className="text-[8px] font-bold text-orange-400 uppercase mb-1">Damage Note</p>
                              <p className="text-xs font-bold text-orange-700">{selectedBooking.tripDetails.end.damageNote}</p>
                           </div>
                         )}
                         {!selectedBooking.tripDetails.end.damageNote && (
                           <div className="flex-1 bg-white rounded-xl p-3 border border-green-100 text-center">
                              <p className="text-[8px] font-bold text-green-400 uppercase mb-1">Condition</p>
                              <p className="text-xs font-bold text-green-700">✓ No damage</p>
                           </div>
                         )}
                      </div>
                   </div>
                )}

                 {/* Settlement Status / Toggle */}
                 {selectedBooking?.status === 'Completed' && ((selectedBooking.tripDetails?.end?.overKmCharge || 0) + (selectedBooking.tripDetails?.end?.lateCharge || 0) + (selectedBooking.tripDetails?.end?.extraCharge || 0)) > 0 && (
                    <div className="bg-white rounded-2xl border border-dashed border-red-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                       <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Settlement</p>
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${selectedBooking.tripDetails?.end?.isSettled ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                             <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedBooking.tripDetails?.end?.isSettled ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedBooking.tripDetails?.end?.isSettled ? 'Extra Amount Paid' : 'Pending Payment'}
                             </p>
                          </div>
                          {selectedBooking.tripDetails?.end?.isSettled && (
                             <p className="text-[10px] font-bold text-slate-900 mt-2 uppercase tracking-widest">
                                Total Paid: <span className="text-sm text-green-600 ml-1">₹{( (selectedBooking.totalAmount || 0) + (selectedBooking.tripDetails.end.overKmCharge || 0) + (selectedBooking.tripDetails.end.lateCharge || 0) + (selectedBooking.tripDetails.end.extraCharge || 0) ).toLocaleString()}</span>
                             </p>
                          )}
                       </div>
                       <button 
                          onClick={(e) => { e.stopPropagation(); toggleSettlement(selectedBooking); }}
                          className={`px-8 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all ${selectedBooking.tripDetails?.end?.isSettled ? 'bg-slate-100 text-slate-500 hover:bg-zinc-100 hover:text-zinc-600' : 'bg-green-600 text-white shadow-lg shadow-green-600/20 hover:bg-black hover:shadow-none'}`}
                       >
                          {selectedBooking.tripDetails?.end?.isSettled ? 'Mark Unpaid' : 'Mark as Paid'}
                       </button>
                    </div>
                 )}

                 {/* Delete */}
                <button
                   onClick={() => deleteBooking(selectedBooking._id || selectedBooking.id)}
                   className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
                >
                   Delete Booking
                </button>
              </div>
           </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          EDIT BOOKING MODAL
      ══════════════════════════════════════ */}
      {editForm && (
        <div className="fixed inset-0 z-[3000] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="bg-white w-full md:max-w-3xl md:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:mx-6">
              {/* Header */}
              <div className="px-6 py-5 md:px-10 md:py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                 <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Admin Override</p>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Edit Booking.</h3>
                 </div>
                 <button onClick={() => setEditForm(null)} className="w-10 h-10 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-hide">
                 {/* Customer Info */}
                 <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Customer Name</label>
                       <input type="text" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 transition-all" value={editForm.userData?.name || ''} onChange={e => setEditForm({...editForm, userData: {...editForm.userData, name: e.target.value}})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                       <input type="text" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 transition-all" value={editForm.userData?.phone || ''} onChange={e => setEditForm({...editForm, userData: {...editForm.userData, phone: e.target.value}})} />
                    </div>
                 </div>

                 {/* Car Reassign */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assign Car</label>
                    <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 uppercase" value={editForm.car?._id || editForm.car?.id || ''} onChange={e => { const selected = cars.find(c => (c._id || c.id) === e.target.value); if(selected) setEditForm({...editForm, car: selected}); }}>
                       <option value="">Select Car...</option>
                       {cars.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name} - ₹{c.price}/day</option>)}
                    </select>
                 </div>

                 {/* Dates */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pickup</p>
                       <input type="date" className="w-full p-3 bg-white border border-slate-100 rounded-xl font-bold text-slate-900 text-sm" value={editForm.pickupDate || ''} onChange={e => setEditForm({...editForm, pickupDate: e.target.value})} />
                       <input type="time" className="w-full p-3 bg-white border border-slate-100 rounded-xl font-bold text-slate-900 text-sm" value={editForm.pickupTime || ''} onChange={e => setEditForm({...editForm, pickupTime: e.target.value})} />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Return</p>
                       <input type="date" className="w-full p-3 bg-white border border-slate-100 rounded-xl font-bold text-slate-900 text-sm" value={editForm.dropDate || ''} onChange={e => setEditForm({...editForm, dropDate: e.target.value})} />
                       <input type="time" className="w-full p-3 bg-white border border-slate-100 rounded-xl font-bold text-slate-900 text-sm" value={editForm.dropTime || ''} onChange={e => setEditForm({...editForm, dropTime: e.target.value})} />
                    </div>
                 </div>

                 {/* Location + Amount */}
                 <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Branch Location</label>
                       <input type="text" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 transition-all" value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Total Amount (₹)</label>
                       <input type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 transition-all text-xl" value={editForm.totalAmount || ''} onChange={e => setEditForm({...editForm, totalAmount: e.target.value})} />
                    </div>
                 </div>

                 {/* Status */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Booking Status</label>
                    <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 uppercase" value={editForm.status || 'Confirmed'} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                       <option>Confirmed</option><option>Driving</option><option>Completed</option><option>Canceled</option>
                    </select>
                 </div>

                 {/* Actions */}
                 <div className="grid grid-cols-2 gap-4 pt-2 pb-4">
                    <button onClick={() => setEditForm(null)} className="py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                    <button onClick={handleEditSubmission} className="py-5 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all">Save Changes</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TRIP START / END MODAL
      ══════════════════════════════════════ */}
      {tripForm && (
        <div className="fixed inset-0 z-[4000] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="bg-white w-full md:max-w-lg md:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:mx-6">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                 <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Trip Action</p>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{tripForm.type === 'start' ? '🚗 Start Trip' : '🏁 End Trip'}</h3>
                 </div>
                 <button onClick={() => setTripForm(null)} className="w-10 h-10 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                 {tripForm.type === 'start' ? (
                   <>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Start Odometer (KM)</label>
                        <input type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 text-2xl tracking-tight" value={startData.km} onChange={e => setStartData({...startData, km: e.target.value})} placeholder="e.g. 12500" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Vehicle Number</label>
                        <input type="text" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 uppercase tracking-widest" placeholder="TN-00-XX-0000" value={startData.vehicleNo} onChange={e => setStartData({...startData, vehicleNo: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Fuel Level</label>
                        <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30" value={startData.petrolLevel} onChange={e => setStartData({...startData, petrolLevel: e.target.value})}>
                           <option>Full</option><option>80%</option><option>60%</option><option>40%</option><option>20%</option><option>Empty</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Car Photos</label>
                        <label className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all relative">
                           <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setStartData({...startData, tempFiles: e.target.files})} />
                           <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{startData.tempFiles ? `${startData.tempFiles.length} file(s) selected` : 'Tap to upload'}</p>
                        </label>
                     </div>
                   </>
                 ) : (
                   <div className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Return Date</label>
                           <input type="date" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 text-sm" value={endData.dropDate} onChange={e => setEndData({...endData, dropDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Return Time</label>
                           <input type="time" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 text-sm" value={endData.dropTime} onChange={e => setEndData({...endData, dropTime: e.target.value})} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Return Odometer (KM)</label>
                        <input type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 text-2xl tracking-tight" value={endData.km} onChange={e => setEndData({...endData, km: e.target.value})} placeholder="e.g. 12800" />
                     </div>

                     {endData.km && (
                        <div className="bg-slate-900 p-5 rounded-2xl text-white space-y-3">
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-3">Live Calculation</p>
                           {[
                             { label: 'Total KM Driven', value: `${calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).totalKm} KM` },
                             { label: `Included (${calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).kmLimitPerDay} KM/day)`, value: `${calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).limit} KM` },
                             { label: 'Extra KM Beyond Limit', value: `${calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).overKm} KM`, highlight: calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).overKm > 0 },
                             { label: `Extra KM Charge (₹${calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).extraKmRate}/km)`, value: `₹${calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).overKmCharge}`, highlight: calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).overKmCharge > 0 },
                             { label: 'Late Return Hours', value: `${calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).lateHours} Hr`, highlight: calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).lateHours > 0 },
                           ].map(row => (
                             <div key={row.label} className="flex justify-between items-center text-xs">
                               <span className="text-slate-500 font-bold uppercase tracking-wide">{row.label}</span>
                               <span className={`font-bold ${row.highlight ? 'text-red-400' : 'text-white'}`}>{row.value}</span>
                             </div>
                           ))}
                           <div className="flex justify-between items-center pt-3 border-t border-white/5">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Late Return Fee (₹150/hr)</span>
                             <span className="text-2xl font-bold text-red-600 tracking-tight">₹ {calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).lateCharge}</span>
                           </div>
                           <div className="flex justify-between items-center bg-red-600/10 p-3 rounded-xl border border-red-600/20">
                             <span className="text-[10px] font-bold text-red-400 uppercase">Total Extra Charges</span>
                             <span className="text-xl font-bold text-red-400 tracking-tight">₹ {calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).overKmCharge + calculateOverage(tripForm.booking, endData.km, endData.dropDate, endData.dropTime).lateCharge}</span>
                           </div>
                        </div>
                     )}

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Extra Charge (₹)</label>
                        <input type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 text-xl" placeholder="0" value={endData.extraCharge} onChange={e => setEndData({...endData, extraCharge: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Final Fuel Level</label>
                        <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none" value={endData.petrolLevel} onChange={e => setEndData({...endData, petrolLevel: e.target.value})}>
                           <option>Full</option><option>80%</option><option>60%</option><option>40%</option><option>20%</option><option>Empty</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Damage / Condition Notes</label>
                        <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-600/30 h-28 resize-none" placeholder="Any damage or notes..." value={endData.damageNote} onChange={e => setEndData({...endData, damageNote: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Return Photos</label>
                        <label className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all relative">
                           <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setEndData({...endData, tempFiles: e.target.files})} />
                           <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{endData.tempFiles ? `${endData.tempFiles.length} file(s) selected` : 'Tap to upload'}</p>
                        </label>
                     </div>
                   </div>
                 )}

                 {/* CTA Buttons */}
                 <div className="grid grid-cols-2 gap-4 pt-2 pb-4">
                    <button onClick={() => setTripForm(null)} className="py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                    <button
                       onClick={tripForm.type === 'start' ? startTrip : endTrip}
                       disabled={uploading}
                       className={`py-5 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 ${tripForm.type === 'start' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                       {uploading ? 'Uploading...' : tripForm.type === 'start' ? 'Confirm Start' : 'Close Trip'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════ */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">
           <button onClick={() => setLightbox({ isOpen: false, photos: [], index: 0 })} className="absolute top-6 right-6 w-14 h-14 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-50 shadow-xl transition-all"><span className="material-symbols-outlined text-3xl">close</span></button>
           <div className="relative w-full h-full flex items-center justify-center group max-w-5xl">
              <button onClick={prevPhoto} className="absolute left-2 md:left-6 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-full flex items-center justify-center z-50 transition-all"><span className="material-symbols-outlined text-3xl">chevron_left</span></button>
              <img src={lightbox.photos[lightbox.index]} className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl" alt="Document" />
              <button onClick={nextPhoto} className="absolute right-2 md:right-6 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-full flex items-center justify-center z-50 transition-all"><span className="material-symbols-outlined text-3xl">chevron_right</span></button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/10 backdrop-blur-xl rounded-full text-white font-bold text-[10px] uppercase tracking-widest border border-white/10">{lightbox.index + 1} / {lightbox.photos.length}</div>
           </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminBookings;
