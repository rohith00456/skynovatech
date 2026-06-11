const InternPortal = ({ internSession, setInternSession }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [internDetails, setInternDetails] = useState(internSession);

  // Remaining days calculation
  const getRemainingDays = () => {
    if (!internDetails.expiry_date) return 'Never Expires';
    const now = new Date();
    const expiry = new Date(internDetails.expiry_date);
    if (expiry < now) return 'Expired';
    const diffTime = Math.abs(expiry - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Days`;
  };

  const fetchPortalData = async () => {
    // Refresh intern details
    const { data: iData } = await supabase.from('interns').select('*').eq('id', internSession.id).single();
    if (iData) setInternDetails(iData);

    const { data: tData } = await supabase.from('intern_tasks').select('*').order('deadline', { ascending: true });
    setTasks(tData || []);
    
    const { data: aData } = await supabase.from('intern_announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(aData || []);
    
    const { data: sData } = await supabase.from('intern_submissions').select('*').eq('intern_id', internSession.id);
    setSubmissions(sData || []);
  };

  useEffect(() => { fetchPortalData(); }, []);

  const handleSubmission = async (e, taskId) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      intern_id: internSession.id,
      task_id: taskId,
      submission_url: fd.get('submission_url'),
      notes: fd.get('notes'),
      status: 'Submitted'
    };
    
    // Check if already submitted, then update, else insert
    const existing = submissions.find(s => s.task_id === taskId);
    if (existing) {
      await supabase.from('intern_submissions').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('intern_submissions').insert([payload]);
    }
    showToast('Task submitted successfully');
    fetchPortalData();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const np = fd.get('new_password');
    const cp = fd.get('confirm_password');
    if (np !== cp) { showToast('Passwords do not match', 'error'); return; }
    const hashed = await hashPassword(np);
    await supabase.from('interns').update({ password_hash: hashed }).eq('id', internSession.id);
    showToast('Password updated securely');
    e.target.reset();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all">
        <div className="p-4 py-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">I</div>
          <span className="font-bold text-xl tracking-tight">Intern Portal</span>
        </div>
        <div className="px-4 py-3 bg-slate-800 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-slate-300">{internDetails.name}</p>
          <p className="text-xs text-slate-400 font-mono">{internDetails.intern_id}</p>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {['Dashboard', 'Tasks & Submissions', 'Announcements', 'Settings'].map(tab => {
            const icons = { 'Dashboard': <Home size={18}/>, 'Tasks & Submissions': <CheckSquare size={18}/>, 'Announcements': <Bell size={18}/>, 'Settings': <Settings size={18}/> };
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                {icons[tab]} {tab}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setInternSession(null)} className="w-full flex items-center gap-2 px-3 py-2 rounded text-red-400 hover:bg-slate-800 transition-colors text-sm font-medium">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-gray-800">{activeTab}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-2 py-1 rounded-full font-medium ${internDetails.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Status: {internDetails.status}
            </span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-100">
              <Clock size={14} className="inline mr-1 -mt-0.5" /> Time Left: {getRemainingDays()}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'Dashboard' && (
            <div className="max-w-4xl space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium mb-1">Assigned Tasks</h3>
                  <p className="text-4xl font-bold">{tasks.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium mb-1">Submitted Tasks</h3>
                  <p className="text-4xl font-bold text-blue-600">{submissions.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 text-lg border-b pb-2">Account Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div><span className="text-gray-500 block">User ID</span><span className="font-mono font-medium">{internDetails.intern_id}</span></div>
                  <div><span className="text-gray-500 block">Name</span><span className="font-medium">{internDetails.name}</span></div>
                  <div><span className="text-gray-500 block">Email</span><span className="font-medium">{internDetails.email || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Phone</span><span className="font-medium">{internDetails.phone || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Expiry Date</span><span className="font-medium text-red-600">{internDetails.expiry_date ? new Date(internDetails.expiry_date).toLocaleString() : 'Never'}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Tasks & Submissions' && (
            <div className="space-y-6 max-w-4xl">
              {tasks.length === 0 && <p className="text-gray-500 bg-white p-6 rounded-xl border text-center">No tasks assigned yet.</p>}
              {tasks.map(t => {
                const sub = submissions.find(s => s.task_id === t.id);
                return (
                  <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{t.title}</h3>
                      {sub ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${sub.status === 'Reviewed' ? 'bg-green-100 text-green-700' : sub.status === 'Needs Revision' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {sub.status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-700">Pending</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{t.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500 mb-6">
                      {t.deadline && <span><Clock size={14} className="inline mr-1"/> Due: {new Date(t.deadline).toLocaleString()}</span>}
                      {t.document_url && <a href={t.document_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline"><FileText size={14} className="inline mr-1"/> Resource Document</a>}
                    </div>

                    <form onSubmit={(e) => handleSubmission(e, t.id)} className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-semibold text-sm mb-3">{sub ? 'Update Submission' : 'Submit Work'}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">Document / Drive URL *</label>
                          <input name="submission_url" required type="url" defaultValue={sub?.submission_url} className="w-full border p-2 rounded text-sm bg-white" placeholder="https://docs.google.com/..." />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">Notes to Admin</label>
                          <textarea name="notes" defaultValue={sub?.notes} rows="2" className="w-full border p-2 rounded text-sm bg-white"></textarea>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                          {sub ? 'Update Submission' : 'Submit Task'}
                        </button>
                      </div>
                    </form>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'Announcements' && (
            <div className="max-w-4xl space-y-4">
              {announcements.length === 0 && <p className="text-gray-500 bg-white p-6 rounded-xl border text-center">No announcements yet.</p>}
              {announcements.map(a => (
                <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-purple-500">
                  <h3 className="font-bold text-lg mb-1">{a.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">{new Date(a.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="max-w-xl bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 text-lg border-b pb-2">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input type="password" name="new_password" required minLength="6" className="w-full border p-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input type="password" name="confirm_password" required minLength="6" className="w-full border p-2 rounded text-sm" />
                </div>
                <button type="submit" className="w-full py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
