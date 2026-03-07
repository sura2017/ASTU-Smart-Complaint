import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Database, Users, CheckCircle, 
  Clock, LayoutGrid, BarChart3, LogOut, Eye,
  ShieldCheck, User, Image as ImageIcon, Mail, UserCircle, ChevronDown
} from 'lucide-react';

// LIVE BACKEND URL
const API_URL = "https://astu-smart-complaint-u7h0.onrender.com";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchAllComplaints = async () => {
    try {
      // Changed to Live API
      const res = await axios.get(`${API_URL}/api/complaints/all`);
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Changed to Live API
      await axios.put(`${API_URL}/api/complaints/update/${id}`, { status: newStatus });
      fetchAllComplaints(); 
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // --- ANALYTICS LOGIC ---
  const totalItems = complaints.length;
  const pendingItems = complaints.filter(c => c.status !== 'Resolved').length;
  const resolvedItems = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionRate = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;

  // --- SEARCH & FILTER LOGIC ---
  const filteredComplaints = complaints.filter(c => {
    const studentName = c.student?.name || "";
    const studentEmail = c.student?.email || "";
    const title = c.title || "";
    const id = c._id || "";

    const matchesSearch = 
      title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "All" || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-10 overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="bg-slate-900 text-white p-3 sm:p-5 shadow-2xl sticky top-0 z-50 border-b border-slate-700">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded shadow-lg">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <h1 className="text-xs sm:text-xl font-black italic tracking-tighter uppercase leading-none">ASTU Portal</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end border-r border-slate-700 pr-4 mr-1 text-right">
               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 font-mono leading-none">Admin Active</span>
                  <UserCircle size={14} className="text-blue-400" />
               </div>
               <p className="text-xs font-bold text-white leading-none mt-1">{user?.name}</p>
               <div className="flex items-center gap-1 opacity-50 mt-1">
                  <Mail size={10} className="text-blue-200" />
                  <p className="text-[9px] font-medium lowercase tracking-tighter leading-none">{user?.email}</p>
               </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-xl font-black text-[9px] sm:text-xs uppercase transition-all flex items-center gap-2 shadow-xl active:scale-95"
            >
              <span>Logout</span>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-3 sm:p-8 lg:p-12">
        
        <header className="mb-6">
          <h2 className="text-2xl xs:text-3xl sm:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Administrator
          </h2>
          <p className="text-slate-400 text-[9px] sm:text-lg font-black flex items-center gap-2 uppercase tracking-[0.2em] mt-2 leading-none">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             Centralized Oversight: {totalItems} Active Tickets
          </p>
        </header>

        {/* ANALYTICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-6 sm:mb-10">
          <StatBox label="Total" val={totalItems} icon={<Database size={16}/>} color="bg-white text-slate-900 border-slate-100" />
          <StatBox label="Rate" val={resolutionRate + "%"} icon={<BarChart3 size={16}/>} color="bg-blue-600 text-white shadow-blue-200" />
          <StatBox label="Pending" val={pendingItems} icon={<Clock size={16}/>} color="bg-amber-400 text-amber-950" />
          <StatBox label="Solved" val={resolvedItems} icon={<CheckCircle size={16}/>} color="bg-emerald-500 text-white shadow-emerald-200" />
        </div>

        {/* WORKLOAD DISTRIBUTION */}
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl mb-12 border border-slate-100">
           <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-3">
             <LayoutGrid size={18} /> Departmental Workload
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
              {['Dormitory', 'Internet', 'Classroom', 'Laboratory'].map(cat => {
                const count = complaints.filter(c => c.category === cat).length;
                const percent = totalItems > 0 ? (count / totalItems) * 100 : 0;
                return (
                  <div key={cat} className="space-y-4 group">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-tighter">{cat}</p>
                      <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shadow-sm">{count} Issues</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 sm:h-3 rounded-full overflow-hidden border border-slate-200 relative shadow-inner">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-1000 group-hover:from-blue-500 group-hover:to-blue-300" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                )
              })}
           </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6 sm:mb-10">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search name, ID or email..." 
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-xs font-bold shadow-sm outline-none focus:ring-2 ring-blue-500/20 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 shadow-sm h-[42px] sm:h-auto">
                <Filter size={14} className="text-slate-400 mr-2" />
                <select 
                    className="bg-transparent font-black uppercase text-[10px] tracking-widest cursor-pointer outline-none min-w-[120px]"
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="All">Categories</option>
                    <option value="Dormitory">Dormitory</option>
                    <option value="Internet">Internet</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Laboratory">Laboratory</option>
                </select>
            </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {filteredComplaints.map((c) => (
            <div key={c._id} className="bg-white p-4 rounded-[1.8rem] shadow-xl border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 max-w-[70%]">
                  <div className="min-w-[36px] h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner"><User size={18}/></div>
                  <div className="overflow-hidden">
                    <p className="font-black text-xs text-slate-900 truncate leading-tight mb-0.5">{c.student?.name || "User"}</p>
                    <div className="flex items-center gap-1.5 opacity-50">
                        <Mail size={10} className="text-blue-500" />
                        <p className="text-[9px] font-bold lowercase truncate">{c.student?.email}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border whitespace-nowrap ${
                    c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>{c.status}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                 <div className="flex items-center gap-1 mb-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none">{c.category}</p>
                 </div>
                 <p className="font-black text-[11px] text-slate-800 uppercase leading-none mb-1 tracking-tight">{c.title}</p>
                 <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight italic">{c.description}</p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                 {c.attachment ? (
                   <a href={`${API_URL}/${c.attachment}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all">
                     See Image <ImageIcon size={12}/>
                   </a>
                 ) : (
                   <div className="flex-1 bg-slate-100 text-slate-300 py-2.5 rounded-xl text-[9px] font-black text-center uppercase italic border border-slate-200">No Image</div>
                 )}
                 <div className="flex-1 relative">
                    <select 
                        className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[9px] font-black uppercase outline-none focus:ring-2 ring-blue-500 shadow-sm appearance-none"
                        value={c.status}
                        onChange={(e) => handleStatusUpdate(c._id, e.target.value)}
                    >
                        <option value="Open">Open</option>
                        <option value="In Progress">Working</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-[0.3em] border-b border-slate-100">
                    <th className="p-10">Student Profile</th>
                    <th className="p-10">Issue Details</th>
                    <th className="p-10 text-center">Documentation</th>
                    <th className="p-10 text-center">Status Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((c) => (
                    <tr key={c._id} className="hover:bg-blue-50/40 transition-all duration-300 group">
                        <td className="p-10 align-top">
                           <div className="flex flex-col gap-1.5">
                              <span className="font-black text-slate-900 text-xl tracking-tight leading-none group-hover:text-blue-600 transition-colors">{c.student?.name || "Anonymous"}</span>
                              <div className="flex items-center gap-2 text-slate-400">
                                 <Mail size={14} className="text-blue-500" />
                                 <span className="text-sm font-bold tracking-tight lowercase">{c.student?.email}</span>
                              </div>
                           </div>
                        </td>

                        <td className="p-10 align-top max-w-lg">
                           <div className="flex items-center gap-3 mb-3">
                              <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter italic shadow-sm">
                                 {c.category}
                              </span>
                              <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</span>
                           </div>
                           <p className="font-black text-slate-800 text-lg leading-tight mb-2 uppercase tracking-tight">
                             {c.title}
                           </p>
                           <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-3 italic">
                             {c.description}
                           </p>
                        </td>

                        <td className="p-10 align-top text-center text-xs">
                           <div className="flex flex-col items-center gap-4">
                             {c.attachment ? (
                                <a href={`${API_URL}/${c.attachment}`} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-100 flex items-center gap-2 group-hover:scale-105 transition-transform">
                                  See Image <ImageIcon size={14} />
                                </a>
                             ) : (
                                <span className="text-slate-200 text-xs italic font-black uppercase tracking-widest">No Media Attached</span>
                             )}
                             <span className="text-[10px] font-black text-slate-300 font-mono tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase leading-none">Ref: {c._id.slice(-8).toUpperCase()}</span>
                           </div>
                        </td>

                        <td className="p-10 align-top">
                           <div className="flex flex-col items-center gap-4 min-w-[180px]">
                              <div className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border-2 text-center flex items-center justify-center gap-2 ${
                                c.status === 'Open' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                c.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${c.status === 'Open' ? 'bg-amber-600' : 'bg-emerald-600 animate-pulse'}`}></div>
                                {c.status}
                              </div>
                              <select 
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-[10px] font-black uppercase outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 cursor-pointer transition-all shadow-sm tracking-widest"
                                value={c.status}
                                onChange={(e) => handleStatusUpdate(c._id, e.target.value)}
                              >
                                <option value="Open">MARK AS OPEN</option>
                                <option value="In Progress">WORKING NOW</option>
                                <option value="Resolved">SET AS RESOLVED</option>
                              </select>
                           </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="4" className="p-40 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-20 text-xs">
                            <LayoutGrid size={80} className="text-slate-300" />
                            <p className="text-slate-400 font-black uppercase text-3xl tracking-[0.4em]">Queue Empty</p>
                        </div>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Analytics Stats
const StatBox = ({label, val, icon, color}) => (
  <div className={`${color} p-4 sm:p-7 rounded-[1.2rem] sm:rounded-[2.2rem] border border-slate-100 flex items-center gap-2 sm:gap-5 transition-all shadow-md group hover:translate-y-[-2px] overflow-hidden`}>
    <div className="bg-black/5 p-2 sm:p-3 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-black/10 transition-colors">{icon}</div>
    <div className="overflow-hidden min-w-0">
      <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</p>
      <h3 className="text-sm sm:text-4xl font-black tracking-tighter leading-none truncate">{val}</h3>
    </div>
  </div>
);

export default AdminDashboard;