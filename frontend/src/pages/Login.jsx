import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Mail, Lock, Github, ArrowRight, ShieldCheck } from 'lucide-react';

// LIVE BACKEND URL
const API_URL = "https://astu-smart-complaint-u7h0.onrender.com";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const hasCalledGitHub = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && !hasCalledGitHub.current) {
      const loginWithGithub = async () => {
        hasCalledGitHub.current = true;
        setLoading(true);
        try {
          // Changed to Live API
          const res = await axios.post(`${API_URL}/api/auth/github-login`, { code });
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          window.history.replaceState({}, document.title, "/");
          navigate('/dashboard');
        } catch (err) {
          if (!localStorage.getItem('token')) alert("GitHub Authentication Failed.");
        } finally {
          setLoading(false);
        }
      };
      loginWithGithub();
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.clear(); 
    try {
      // Changed to Live API
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'Staff') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      alert("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    localStorage.clear(); 
    const details = jwtDecode(credentialResponse.credential);
    try {
      // Changed to Live API
      const res = await axios.post(`${API_URL}/api/auth/google-login`, {
        name: details.name,
        email: details.email,
        googleId: details.sub
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert("Google Sign-In failed.");
    }
  };

  const handleGitHubLogin = () => {
    localStorage.clear();
    const clientId = 'Ov23ctjRMz8lcuGM4era';
    // NOTE: When you deploy the frontend, change this redirectUri to your Vercel link!
    const redirectUri = window.location.origin; 
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-2 sm:p-4 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[380px] sm:max-w-md z-10">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4 px-6 text-center text-white">
             <div className="flex items-center justify-center gap-3">
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black backdrop-blur-sm border border-white/30">
                  ASTU
                </div>
                <h2 className="text-xl font-black tracking-tight uppercase">Student Portal</h2>
             </div>
             <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Smart Complaint System</p>
          </div>

          <div className="p-6 sm:p-8 space-y-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-700 transition-all placeholder:text-slate-300"
                  placeholder="University Email"
                  onChange={(e) => setEmail(e.target.value)} required 
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-700 transition-all placeholder:text-slate-300"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)} required 
                />
              </div>
              
              <button 
                disabled={loading}
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 text-xs tracking-widest disabled:opacity-50"
              >
                {loading ? "VERIFYING..." : "SIGN IN TO PORTAL"}
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-3 text-slate-300 text-[9px] font-black uppercase tracking-widest">Unified Login</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-center transform scale-95 origin-center">
                <GoogleLogin 
                    onSuccess={handleGoogleSuccess} 
                    onError={() => console.log('Login Failed')} 
                    shape="pill" 
                    theme="filled_blue" 
                    text="continue_with"
                    width="300px"
                />
              </div>
              
              <button 
                onClick={handleGitHubLogin}
                className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-full flex items-center justify-center gap-3 transition-all active:scale-95 border border-slate-800 shadow-md"
              >
                <Github className="w-4 h-4" />
                <span className="text-xs font-black tracking-tight">Continue with GitHub</span>
              </button>
            </div>

            <div className="pt-2 text-center">
                <p className="text-slate-400 font-medium text-xs">
                  New here? <Link to="/register" className="text-blue-600 font-black hover:underline underline-offset-4 ml-1">Create an account</Link>
                </p>
            </div>
          </div>

          <div className="bg-slate-50 py-3 text-center border-t border-slate-100 flex items-center justify-center gap-2">
             <ShieldCheck className="w-3 h-3 text-emerald-500" />
             <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">Authorized ASTU SSL Secure</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-4 text-slate-500 text-[9px] font-black uppercase tracking-widest opacity-40">
            <span>Privacy</span>
            <span>ASTU Help</span>
            <span>Terms</span>
      </div>
    </div>
  );
};

export default Login;