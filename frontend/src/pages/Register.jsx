import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
const API_URL = "https://astu-smart-complaint-u7h0.onrender.com";

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- 100% CORRECT PASSWORD VALIDATION LOGIC (8-32 Chars + Complexity) ---
  const validatePassword = (password) => {
    /**
     * REGEX EXPLANATION:
     * ^(?=.*[a-z])    : At least one lowercase letter
     * (?=.*[A-Z])     : At least one uppercase letter
     * (?=.*\d)        : At least one number
     * (?=.*[@$!%*?&]) : At least one special character
     * [A-Za-z\d@$!%*?&]{8,32}$ : Total length between 8 and 32 characters
     */
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
    return regex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Validate Password Strength & Length (8-32)
    if (!validatePassword(formData.password)) {
      alert(
        "❌ SECURITY ERROR: Password does not meet ASTU requirements:\n\n" +
        "• Length: 8 to 32 characters\n" +
        "• Must include at least one CAPITAL letter (A-Z)\n" +
        "• Must include at least one small letter (a-z)\n" +
        "• Must include at least one number (0-9)\n" +
        "• Must include at least one special character (@$!%*?&)"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);
      alert("Registration Successful! Your account is secured with a complex 8-32 character password.");
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed: Email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-2 sm:p-4 font-sans relative overflow-hidden text-slate-900">
      
      {/* High-End Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[380px] sm:max-w-md z-10">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
          
          {/* 1. COMPRESSED HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4 px-6 text-center text-white">
             <div className="flex items-center justify-center gap-3">
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black backdrop-blur-sm border border-white/30">
                  ASTU
                </div>
                <h2 className="text-xl font-black tracking-tight uppercase leading-none">Create Account</h2>
             </div>
             <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Smart Complaint Portal</p>
          </div>

          <div className="p-6 sm:p-8 space-y-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-700 transition-all placeholder:text-slate-300"
                  placeholder="Full Name"
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required 
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-700 transition-all placeholder:text-slate-300"
                  placeholder="University Email"
                  onChange={(e) => setFormData({...formData, email: e.target.value})} required 
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-700 transition-all placeholder:text-slate-300"
                  placeholder="Password (8-32 Chars)"
                  onChange={(e) => setFormData({...formData, password: e.target.value})} required 
                />
                {/* Visual Security Hint */}
                <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                   <ShieldCheck size={10} className="text-indigo-400" />
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                      Must include: A-Z, a-z, 0-9, and @$!%*?&
                   </p>
                </div>
              </div>
              
              <button 
                disabled={loading}
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 text-xs tracking-widest mt-2 disabled:opacity-50"
              >
                {loading ? "VALIDATING..." : "REGISTER ACCOUNT"}
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>

            <div className="pt-2 text-center border-t border-slate-50">
                <p className="text-slate-400 font-medium text-xs">
                  Already have an account? <Link to="/" className="text-blue-600 font-black hover:underline underline-offset-4 ml-1">Log In</Link>
                </p>
            </div>
          </div>

          <div className="bg-slate-50 py-3 text-center border-t border-slate-100 flex items-center justify-center gap-2">
             <ShieldCheck className="w-3 h-3 text-emerald-500" />
             <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">Authorized ASTU Student Access</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-4 text-slate-500 text-[9px] font-black uppercase tracking-widest opacity-40">
            <span>Portal Security</span>
            <span className="w-1 h-1 bg-slate-500 rounded-full mt-1"></span>
            <span>Policy Compliance</span>
      </div>
    </div>
  );
};

export default Register;