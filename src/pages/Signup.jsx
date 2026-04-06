import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signup = useStore((state) => state.signup);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please provide all the details.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signup(formData);

    if (result.success) {
      const query = new URLSearchParams(location.search);
      const redirect = query.get('redirect');
      navigate(redirect || '/');
    } else {
      setError(result.message || 'Onboarding failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body overflow-x-hidden selection:bg-red-500/20">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden pt-32 pb-24">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-600/5 blur-[100px] rounded-full -translate-y-1/2 -translate-x-1/2"></div>

        <div className="w-full max-w-md bg-white px-8 py-10 md:p-14 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 relative z-10 transition-all duration-500 hover:shadow-xl">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-red-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-8 shadow-xl shadow-red-600/10">RG</div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none mb-4">Register.</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-loose">Start your self-drive journey</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {[
              { key: 'name', label: 'Full Name', placeholder: 'e.g. John Doe', type: 'text' },
              { key: 'phone', label: 'Phone Number', placeholder: 'e.g. 9876543210', type: 'tel', charLimit: 10 },
              { key: 'email', label: 'Email Address', placeholder: 'e.g. john@mail.com', type: 'email' },
              { key: 'password', label: 'Create Password', placeholder: '••••••••', type: 'password' },
            ].map(field => (
              <div key={field.key} className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">{field.label}</label>
                 <input 
                   type={field.type}
                   className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-red-600/30 transition-all outline-none ${field.type === 'email' ? 'lowercase' : ''}`} 
                   placeholder={field.placeholder}
                   maxLength={field.charLimit}
                   value={formData[field.key]}
                   onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                 />
              </div>
            ))}

            {error && (
              <div className="bg-red-50 p-4 rounded-xl">
                 <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-black transition-all flex items-center justify-center gap-4 mt-4"
            >
              {loading ? 'Creating Account...' : 'Sign Up Account'} 
              {!loading && <span className="material-symbols-outlined text-sm font-bold">how_to_reg</span>}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-slate-50">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Member already? <Link to="/login" className="text-red-600 hover:underline ml-2">Sign In</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Signup;
