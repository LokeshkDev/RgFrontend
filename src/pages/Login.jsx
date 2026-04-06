import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../store/useStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotData, setForgotData] = useState({ identifier: '', newPassword: '' });
  const [resetStatus, setResetStatus] = useState({ loading: false, msg: '' });

  const login = useStore((state) => state.login);
  const selectedCar = useStore((state) => state.selectedCar);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data);
        if (data.role === 'admin') {
          navigate('/admin');
        } else if (selectedCar) {
          navigate('/booking');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Incorrect login details.');
      }
    } catch (err) {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateIdentifier = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    return emailRegex.test(val) || phoneRegex.test(val);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateIdentifier(forgotData.identifier)) {
       setResetStatus({ loading: false, msg: 'Enter a valid email or phone.' });
       return;
    }
    if (forgotData.newPassword.length < 6) {
       setResetStatus({ loading: false, msg: 'Password too short.' });
       return;
    }

    setResetStatus({ loading: true, msg: '' });
    try {
       const res = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(forgotData)
       });
       const data = await res.json();
       if (res.ok) {
          setResetStatus({ loading: false, msg: 'Success! You can login now.' });
          setTimeout(() => { setShowForgot(false); setResetStatus({ loading: false, msg: '' }); }, 2000);
       } else {
          setResetStatus({ loading: false, msg: data.message });
       }
    } catch (err) {
       setResetStatus({ loading: false, msg: 'Failed to reset.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body overflow-x-hidden selection:bg-red-500/20">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden pt-32 pb-24">
        {/* Subtle Background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

        <div className="w-full max-w-md bg-white px-8 py-10 md:p-14 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 relative z-10 transition-all duration-500 hover:shadow-xl">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-red-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-xl shadow-red-600/10">RG</div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-none mb-4">Login.</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">Access your self-drive account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-900 font-bold text-sm focus:border-red-600/30 transition-all outline-none" 
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                 <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline">Forgot?</button>
              </div>
              <input 
                type="password" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-900 font-bold text-sm focus:border-red-600/30 transition-all outline-none" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-xl">
                 <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-black transition-all flex items-center justify-center gap-3"
            >
              {loading ? 'Logging in...' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined text-sm">login</span>}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-slate-50 space-y-4">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              New to RG Self Drive? <Link to="/signup" className="text-red-600 hover:underline inline-block ml-2">Create Account</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Forgot Password Reset Refined */}
      {showForgot && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button 
                onClick={() => setShowForgot(false)}
                className="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:text-red-500 transition-all shadow-sm font-bold"
              >
                 <span className="material-symbols-outlined">close</span>
              </button>
              
              <div className="text-center mb-10">
                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password.</h2>
                 <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 font-normal">Recover your access</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email or Phone</label>
                    <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-red-600/20" placeholder="9876543210" value={forgotData.identifier} onChange={e => setForgotData({...forgotData, identifier: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                    <input type="password" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-red-600/20" placeholder="••••••••" value={forgotData.newPassword} onChange={e => setForgotData({...forgotData, newPassword: e.target.value})} />
                 </div>

                 {resetStatus.msg && (
                    <div className={`p-4 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest border transition-all ${resetStatus.msg.includes('Success') ? 'bg-green-50 text-green-600 border-green-100 font-bold' : 'bg-red-50 text-red-600 border-red-100'}`}>
                       {resetStatus.msg}
                    </div>
                 )}

                 <button 
                   type="submit" 
                   disabled={resetStatus.loading}
                   className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                 >
                    {resetStatus.loading ? 'Updating...' : 'Commit New Password'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

export default Login;
