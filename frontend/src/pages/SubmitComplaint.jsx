import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const SubmitComplaint = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dormitory');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // --- FORM VALIDATION ---
  const validateForm = () => {
    if (title.length < 5) return "Title must be at least 5 characters.";
    if (description.length < 15) return "Please provide a more detailed description (min 15 chars).";
    if (!file) return "You must attach a photo as evidence.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
        alert(error);
        return;
    }

    if (!user || !user.id) {
        alert("Session expired. Please login again.");
        navigate('/');
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('studentId', user.id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('attachment', file);

    try {
      await axios.post('http://localhost:5000/api/complaints/submit', formData);
      alert("Success! Your ticket has been logged and the department notified.");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Top Back Link */}
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-blue-600 transition-colors w-fit group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            {/* Form Header */}
            <div className="mb-8">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Create Ticket</h2>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl w-fit">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-tight">Logging as {user?.name}</span>
                </div>
            </div>
            
            <div className="space-y-5">
                {/* Subject */}
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Issue Subject</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition-all placeholder:text-slate-300" 
                        placeholder="e.g. Water Leakage, No WiFi Signal" 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                    />
                </div>
                
                {/* Description */}
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Description & Location</label>
                    <textarea 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold h-32 transition-all placeholder:text-slate-300 resize-none" 
                        placeholder="Include Block and Room Number..." 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Category */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Department</label>
                        <select 
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-black text-xs uppercase cursor-pointer" 
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>Dormitory</option>
                            <option>Laboratory</option>
                            <option>Internet</option>
                            <option>Classroom</option>
                        </select>
                    </div>

                    {/* File Upload Trigger */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Evidence Photo</label>
                        <label className={`flex flex-col items-center justify-center w-full h-[60px] border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                            <div className="flex items-center gap-2">
                                {file ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <UploadCloud className="w-4 h-4 text-slate-400" />}
                                <span className={`text-[10px] font-black uppercase ${file ? 'text-emerald-700' : 'text-slate-500'}`}>
                                    {file ? "Photo Attached" : "Upload Image"}
                                </span>
                            </div>
                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
                        </label>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-blue-100 transition-all active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> 
                                UPLOADING TICKET...
                            </>
                        ) : (
                            "SUBMIT COMPLAINT"
                        )}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-slate-300">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">System records timestamp and user ID automatically</span>
                    </div>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;