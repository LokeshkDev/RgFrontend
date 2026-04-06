import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Booking() {
  const navigate = useNavigate();
  const { 
    user,
    selectedLocation, 
    pickupDate, pickupTime,
    dropDate, dropTime,
    selectedCar, 
    addBooking, 
    clearBooking
  } = useStore();
  
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    email: user?.email || '' 
  });
  
  const [selectedFiles, setSelectedFiles] = useState({ license: null, identityProof: null });
  const [uploading, setUploading] = useState(false);
  const [uploadedPaths, setUploadedPaths] = useState({ license: '', identityProof: '' });
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name, phone: user.phone || '', email: user.email });
    }
  }, [user]);

  const [paymentType, setPaymentType] = useState('upi'); 
  const [upiProvider, setUpiProvider] = useState('gpay');

  const calculateDays = (pickup, drop) => {
    if (!pickup || !drop) return 1;
    const p = new Date(pickup);
    const d = new Date(drop);
    const diff = Math.ceil((d - p) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const days = calculateDays(pickupDate, dropDate);
  const rentalAmount = selectedCar ? selectedCar.price * days : 0;
  const depositAmount = 5000;
  const totalAmount = rentalAmount + depositAmount;

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.phone)) {
       alert("Please enter your name and phone number.");
       return;
    }
    if (step === 2 && !user) navigate('/signup?redirect=/booking');
    else setStep(step + 1);
  };
  
  const handleBack = () => {
    if (step === 1) navigate('/fleet');
    else setStep(step - 1);
  };

  const handleFileUpload = (type, e) => {
    const file = e.target.files[0];
    if (file) setSelectedFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleDocumentCommit = async () => {
    if (!selectedFiles.license || !selectedFiles.identityProof) {
       alert("Please upload both Driving License and ID Proof.");
       return;
    }
    setUploading(true);
    const data = new FormData();
    data.append('license', selectedFiles.license);
    data.append('identityProof', selectedFiles.identityProof);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: data,
      });
      const paths = await response.json();
      setUploadedPaths(paths);
      handleNext();
    } catch (err) {
      alert("Error uploading documents.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmReservation = async () => {
    const finalBooking = {
      id: `RG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      car: selectedCar,
      location: selectedLocation,
      pickupDate, pickupTime,
      dropDate, dropTime,
      durationDays: days,
      userData: formData,
      docs: uploadedPaths,
      payment: { method: paymentType, provider: upiProvider },
      rentalAmount, depositAmount, totalAmount,
      date: new Date().toISOString(),
      status: 'Confirmed'
    };
    
    const result = await addBooking(finalBooking);
    if (result.success) {
       setShowSummaryModal(true);
    } else {
       alert("Booking failed. Please try again.");
    }
  };

  if (!selectedCar) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <div className="text-center space-y-6">
              <span className="material-symbols-outlined text-6xl text-slate-200">car_rental</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No car selected for booking</p>
              <button onClick={() => navigate('/fleet')} className="px-10 py-5 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest">Select a Car</button>
           </div>
        </div>
     );
  }

  return (
    <div className="bg-slate-50 font-body min-h-screen overflow-x-hidden selection:bg-red-500/20 text-slate-900">
      <Header />
      
      <main className="pt-32 md:pt-40 px-6 md:px-12 max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
           <div className="space-y-4">
              <span className="px-5 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg">Step {step} of 4</span>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-none">Checkout.</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{step === 4 ? 'Payment gateway node' : 'Provide trip details'}</p>
           </div>
           
           {/* Steps Indicator */}
           <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map(i => (
                 <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step >= i ? 'w-10 bg-red-600 shadow-lg shadow-red-600/20' : 'w-4 bg-slate-200'}`}></div>
              ))}
           </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[500px]">
           {step === 1 && (
              <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100 space-y-12 animate-in fade-in duration-500">
                 <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Your Details.</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Enter your personal information for the registry</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Full Name</label>
                       <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 focus:border-red-600/30 outline-none transition-all" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Phone Number</label>
                       <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 focus:border-red-600/30 outline-none transition-all" placeholder="e.g. 9876543210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex justify-between items-center pt-8">
                    <button onClick={handleBack} className="px-10 py-5 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-600">Cancel</button>
                    <button onClick={handleNext} className="px-14 py-6 bg-red-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-black transition-all">Next Step</button>
                 </div>
              </div>
           )}

           {step === 2 && (
              <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100 space-y-12 animate-in fade-in duration-500">
                 <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Identity Proof.</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Upload clear photos of your documents</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-50">
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Driving License</label>
                       <div className="relative h-48 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload('license', e)} />
                          {selectedFiles.license ? (
                             <p className="text-[10px] font-bold text-green-600 truncate px-4">{selectedFiles.license.name}</p>
                          ) : (
                             <>
                                <span className="material-symbols-outlined text-4xl text-slate-300">badge</span>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">Upload Front View</p>
                             </>
                          )}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Identification Proof</label>
                       <div className="relative h-48 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload('identityProof', e)} />
                          {selectedFiles.identityProof ? (
                             <p className="text-[10px] font-bold text-green-600 truncate px-4">{selectedFiles.identityProof.name}</p>
                          ) : (
                             <>
                                <span className="material-symbols-outlined text-4xl text-slate-300">fingerprint</span>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">Aadhar or Passport</p>
                             </>
                          )}
                       </div>
                    </div>
                 </div>
                 <div className="flex justify-between items-center pt-8">
                    <button onClick={handleBack} className="px-10 py-5 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-600">Go Back</button>
                    <button onClick={handleDocumentCommit} disabled={uploading} className="px-14 py-6 bg-red-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-black transition-all disabled:opacity-50">
                       {uploading ? 'Uploading...' : 'Verify Documents'}
                    </button>
                 </div>
              </div>
           )}

           {step === 3 && (
              <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100 space-y-12 animate-in fade-in duration-500">
                 <div className="space-y-4 text-center">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Payment Node.</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select your preferred payment method</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <button onClick={() => setPaymentType('upi')} className={`p-8 rounded-[2.5rem] border transition-all text-left group ${paymentType === 'upi' ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-white'}`}>
                       <span className="material-symbols-outlined text-3xl mb-6">qr_code_2</span>
                       <p className="text-xl font-bold tracking-tight">UPI Transfer</p>
                       <p className="text-[9px] font-bold uppercase tracking-widest mt-2">GPay, PhonePe, Paytm</p>
                    </button>
                    <button onClick={() => setPaymentType('cod')} className={`p-8 rounded-[2.5rem] border transition-all text-left group ${paymentType === 'cod' ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-white'}`}>
                       <span className="material-symbols-outlined text-3xl mb-6">currency_rupee</span>
                       <p className="text-xl font-bold tracking-tight">Cash on Delivery</p>
                       <p className="text-[9px] font-bold uppercase tracking-widest mt-2">Pay at branch hub</p>
                    </button>
                 </div>

                 {paymentType === 'upi' && (
                    <div className="grid grid-cols-3 gap-6 pt-6">
                       {['gpay', 'phonepe', 'whatsapp'].map(p => (
                          <button key={p} onClick={() => setUpiProvider(p)} className={`p-6 rounded-2xl border transition-all text-[10px] font-bold uppercase tracking-widest text-center ${upiProvider === p ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{p}</button>
                       ))}
                    </div>
                 )}

                 <div className="flex justify-between items-center pt-10">
                    <button onClick={handleBack} className="px-10 py-5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Go Back</button>
                    <button onClick={handleConfirmReservation} className="px-14 py-7 bg-red-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-2xl shadow-red-600/20 hover:bg-black transition-all">Confirm Booking</button>
                 </div>
              </div>
           )}
        </div>

        {/* Floating Price Summary */}
        <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-80 h-80 bg-red-600 opacity-10 blur-[100px] rounded-full"></div>
           
           {/* Car + Price row */}
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div className="space-y-1">
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Selected Vehicle</p>
                 <h4 className="text-3xl font-bold tracking-tight uppercase leading-none">{selectedCar.name}</h4>
                 <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest mt-2">Verified Self-Drive Fleet</p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Net Payable</p>
                 <p className="text-5xl font-bold text-red-600 tracking-tight leading-none">₹{totalAmount.toLocaleString()}</p>
              </div>
           </div>

           {/* Breakdown row */}
           <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 mb-6">
              <div>
                 <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Rental Fee</p>
                 <p className="text-lg font-bold">₹{rentalAmount.toLocaleString()}</p>
              </div>
              <div>
                 <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Refundable Deposit</p>
                 <p className="text-lg font-bold">₹{depositAmount.toLocaleString()}</p>
              </div>
              <div>
                 <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Duration</p>
                 <p className="text-lg font-bold">{days} {days === 1 ? 'Day' : 'Days'}</p>
              </div>
           </div>

           {/* ── Extra Charges Note ── */}
           <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <span className="material-symbols-outlined text-amber-400 text-[14px]">info</span>
                 Additional Charges May Apply
              </p>
              <div className="flex flex-wrap gap-2">
                 <span className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[13px]">speed</span>
                    {selectedCar.dailyKmLimit || 300} KM/day included free
                 </span>
                 <span className="flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[13px]">add_road</span>
                    ₹{selectedCar.extraKmCharge || 12}/km beyond limit
                 </span>
                 <span className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    ₹150/hr late return fee
                 </span>
              </div>
              <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                 These charges are calculated by admin at trip close and added to your final bill if applicable.
              </p>
           </div>
        </div>

        {/* Success Modal */}
        {showSummaryModal && (
           <div className="fixed inset-0 z-[5000] bg-slate-950/70 backdrop-blur-3xl animate-in fade-in duration-500 flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-lg p-10 md:p-16 rounded-[4rem] shadow-2xl relative animate-in zoom-in-95 duration-500 flex flex-col items-center text-center space-y-12">
                 <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined text-4xl text-white font-bold">check_circle</span>
                 </div>
                 <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tighter leading-none">SUCCESS!</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">Your reservation node has been committed.</p>
                 </div>
                 <div className="w-full space-y-4 pt-4">
                    <button onClick={() => { clearBooking(); navigate('/'); }} className="w-full py-7 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-black transition-all">Go to Home</button>
                    <button onClick={() => { clearBooking(); navigate('/account'); }} className="w-full py-7 bg-slate-50 text-slate-900 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">View in Profile</button>
                 </div>
              </div>
           </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Booking;
