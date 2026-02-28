import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // --- NOTIFICATION STATES ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hello! I am the ASTU Smart Assistant. I can help you track complaints, or provide info on maintenance for Dorms, ICT, and Labs. How can I assist you today?" 
    }
  ]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- FETCH COMPLAINTS & NOTIFICATIONS ---
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    const fetchData = async () => {
      try {
        const compRes = await axios.get(`http://localhost:5000/api/complaints/student/${user.id}`);
        setComplaints(compRes.data);
        
        const notifRes = await axios.get(`http://localhost:5000/api/complaints/notifications/${user.id}`);
        setNotifications(notifRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const markNotificationsRead = async () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unreadCount > 0) {
      try {
        await axios.put(`http://localhost:5000/api/complaints/notifications/read/${user.id}`);
        // Update local state to clear the red dot
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Error marking read", err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const userMsg = { sender: 'user', text: chatMessage };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = chatMessage;
    setChatMessage("");
    setIsTyping(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chat', { message: currentInput });
      setTimeout(() => {
        const botMsg = { sender: 'bot', text: res.data.reply };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 600);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "Connection error with AI brain." }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* --- STICKY NAVBAR --- */}
      <nav className="bg-blue-900 text-white shadow-2xl p-3 sm:p-4 sticky top-0 z-40 border-b border-blue-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-white text-blue-900 font-black px-2 py-0.5 rounded shadow-inner transform group-hover:rotate-3 transition">ASTU</div>
            <h1 className="text-lg font-black tracking-tighter italic hidden xs:block">Smart Complaint</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            {/* --- NOTIFICATION BELL --- */}
            <div className="relative">
              <button onClick={markNotificationsRead} className="relative p-2 text-blue-200 hover:text-white transition">
                <span className="text-xl sm:text-2xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-blue-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-72 sm:w-80 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400">Activity Updates</div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n._id} className={`p-4 border-b border-slate-50 transition ${n.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}>
                         <p className="text-xs font-bold text-slate-700 leading-tight">{n.message}</p>
                         <p className="text-[9px] text-slate-400 mt-1 uppercase font-black">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    )) : <p className="p-8 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">No new updates</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3 border-r border-blue-700 pr-6">
               <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center font-bold border border-blue-500 text-xs uppercase">
                  {user?.name?.charAt(0)}
               </div>
               <div>
                  <p className="text-[9px] text-blue-300 uppercase font-black leading-none">Student</p>
                  <p className="text-xs font-bold leading-tight">{user?.name}</p>
               </div>
            </div>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 sm:px-6 sm:py-2 rounded-xl text-[10px] font-black transition-all shadow-lg active:scale-95 uppercase tracking-widest">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
        {/* --- COMPRESSED HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-2 italic">Dashboard</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {complaints.length} Tickets Found
            </div>
          </div>
          <Link to="/submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-3 text-sm">
            <span className="text-2xl leading-none">+</span> New Complaint
          </Link>
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {complaints.length > 0 ? (
            complaints.map((c) => (
              <div key={c._id} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col h-full">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                  {c.attachment ? (
                    <img src={`http://localhost:5000/${c.attachment}`} alt="issue" className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 italic">
                      <span className="text-2xl opacity-30">📷</span>
                      <span className="text-[8px] font-black uppercase tracking-widest">No evidence attached</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border ${
                      c.status === 'Open' ? 'bg-amber-400/90 text-amber-950 border-amber-300' : 
                      c.status === 'In Progress' ? 'bg-blue-500/90 text-white border-blue-400' : 'bg-emerald-500/90 text-white border-emerald-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <span className="text-blue-600 text-[9px] font-black rounded-lg uppercase tracking-tighter mb-2 italic">
                     Dept: {c.category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                    {c.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-grow line-clamp-2">
                    {c.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[9px] font-black text-slate-300 uppercase">#{c._id.slice(-6).toUpperCase()}</span>
                    <p className="text-[9px] font-black text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 shadow-inner">
              <div className="text-6xl mb-4 grayscale opacity-20">📂</div>
              <p className="text-slate-400 text-lg font-black uppercase tracking-widest">Inbox Empty</p>
            </div>
          )}
        </div>
      </div>

      {/* --- AI CHATBOT PILL BUTTON --- */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button onClick={() => setIsChatOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-110 active:scale-90 border-4 border-white">
            <span className="text-2xl">🤖</span>
            <div className="text-left hidden xs:block">
              <p className="text-[8px] uppercase font-black leading-none opacity-70 tracking-widest">ASTU AI Help</p>
              <p className="text-sm font-black tracking-tight">Ask Chatbot</p>
            </div>
          </button>
        ) : (
          <div className="bg-white w-[20rem] sm:w-[24rem] h-[480px] rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="bg-blue-900 p-6 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-blue-400 text-xl">🤖</div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[8px] text-blue-200 uppercase font-black tracking-widest">Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center transition text-2xl">✕</button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4 flex flex-col no-scrollbar">
              {messages.map((m, index) => (
                <div key={index} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm text-xs font-medium leading-relaxed ${
                    m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="bg-slate-200 text-slate-400 p-3 rounded-2xl rounded-tl-none italic text-[10px] w-20 text-center animate-pulse">Thinking...</div>}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleAiChat} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 border-none rounded-xl px-5 py-3 text-xs font-bold focus:ring-2 ring-blue-500 outline-none transition-all" />
              <button type="submit" className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg active:scale-90" disabled={isTyping}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;