// --- INTERN MANAGEMENT MODULES ---

const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateRandomPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let pass = '';
  pass += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  pass += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  pass += '0123456789'[Math.floor(Math.random() * 10)];
  pass += '!@#$%^&*'[(Math.floor(Math.random() * 8))];
  for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass.split('').sort(() => 0.5 - Math.random()).join('');
};

const InternsManagement = () => {
  const [activeTab, setActiveTab] = useState('Accounts');
  
  // Applications
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  
  // Accounts
  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);
  const [prefilledApp, setPrefilledApp] = useState(null);

  const fetchApplications = async () => {
    setLoadingApps(true);
    const { data } = await supabase.from('intern_applications').select('*').order('created_at', { ascending: false });
    setApplications(data || []);
    setLoadingApps(false);
  };

  const fetchInterns = async () => {
    setLoadingInterns(true);
    const { data } = await supabase.from('interns').select('*').order('created_at', { ascending: false });
    setInterns(data || []);
    setLoadingInterns(false);
  };

  useEffect(() => {
    if (activeTab === 'Applications') fetchApplications();
    else fetchInterns();
  }, [activeTab]);

  const updateAppStatus = async (id, status) => {
    await supabase.from('intern_applications').update({ status }).eq('id', id);
    fetchApplications();
    showToast(`Application ${status}`);
  };

  const handleApprove = (app) => {
    setPrefilledApp(app);
    setActiveTab('Accounts');
    setAccountModalOpen(true);
  };

  const updateInternStatus = async (id, status) => {
    await supabase.from('interns').update({ status }).eq('id', id);
    fetchInterns();
    showToast(`Intern marked as ${status}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Suspended': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Internships Management</h2>
        <button onClick={() => { setEditingIntern(null); setPrefilledApp(null); setAccountModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Create Intern Account
        </button>
      </div>

      <div className="flex border-b mb-6">
        {['Accounts', 'Applications'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {activeTab === 'Applications' && (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-medium text-gray-600">Applicant Name</th>
                  <th className="p-4 font-medium text-gray-600">Email</th>
                  <th className="p-4 font-medium text-gray-600">Phone</th>
                  <th className="p-4 font-medium text-gray-600">Resume URL</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingApps ? <tr><td colSpan="6" className="text-center p-8"><Spinner /></td></tr> :
                 applications.map(app => (
                   <tr key={app.id} className="border-b hover:bg-gray-50">
                     <td className="p-4 font-medium">{app.name}</td>
                     <td className="p-4">{app.email}</td>
                     <td className="p-4">{app.phone}</td>
                     <td className="p-4"><a href={app.resume_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Resume</a></td>
                     <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>{app.status}</span></td>
                     <td className="p-4 text-right flex justify-end gap-2">
                       {app.status === 'Pending' && (
                         <>
                           <button onClick={() => updateAppStatus(app.id, 'Rejected')} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100">Reject</button>
                           <button onClick={() => handleApprove(app)} className="px-3 py-1 bg-green-50 text-green-600 rounded text-sm hover:bg-green-100">Approve & Create</button>
                         </>
                       )}
                     </td>
                   </tr>
                 ))
                }
                {applications.length === 0 && !loadingApps && <tr><td colSpan="6" className="text-center p-8 text-gray-500">No applications found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Accounts' && (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-medium text-gray-600">User ID</th>
                  <th className="p-4 font-medium text-gray-600">Name</th>
                  <th className="p-4 font-medium text-gray-600">Email</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600">Expiry Date</th>
                  <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingInterns ? <tr><td colSpan="6" className="text-center p-8"><Spinner /></td></tr> :
                 interns.map(i => {
                   const isExpired = i.expiry_date && new Date(i.expiry_date) < new Date();
                   const displayStatus = isExpired && i.status === 'Active' ? 'Expired' : i.status;
                   return (
                     <tr key={i.id} className="border-b hover:bg-gray-50">
                       <td className="p-4 font-bold text-gray-800">{i.intern_id}</td>
                       <td className="p-4 font-medium">{i.name}</td>
                       <td className="p-4">{i.email}</td>
                       <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(displayStatus)}`}>{displayStatus}</span></td>
                       <td className="p-4 text-sm">
                         {i.expiry_date ? new Date(i.expiry_date).toLocaleString() : 'Never'}
                         {isExpired && displayStatus !== 'Completed' && <span className="block text-xs text-red-500">Access Denied</span>}
                       </td>
                       <td className="p-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button onClick={() => { setEditingIntern(i); setPrefilledApp(null); setAccountModalOpen(true); }} className="text-blue-600 hover:underline text-sm font-medium">Edit / Renew</button>
                           {displayStatus === 'Active' && <button onClick={() => updateInternStatus(i.id, 'Suspended')} className="text-orange-600 hover:underline text-sm font-medium">Suspend</button>}
                           {displayStatus === 'Suspended' && <button onClick={() => updateInternStatus(i.id, 'Active')} className="text-green-600 hover:underline text-sm font-medium">Reactivate</button>}
                         </div>
                       </td>
                     </tr>
                   );
                 })
                }
                {interns.length === 0 && !loadingInterns && <tr><td colSpan="6" className="text-center p-8 text-gray-500">No intern accounts found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAccountModalOpen && (
        <CreateInternModal 
          onClose={() => { setAccountModalOpen(false); setPrefilledApp(null); setEditingIntern(null); fetchInterns(); }} 
          prefilled={prefilledApp} 
          existing={editingIntern} 
        />
      )}
    </div>
  );
};

const CreateInternModal = ({ onClose, prefilled, existing }) => {
  const [internId, setInternId] = useState('');
  const [password, setPassword] = useState('');
  const [expiryType, setExpiryType] = useState('30');
  const [customExpiry, setCustomExpiry] = useState('');
  
  useEffect(() => {
    if (existing) {
      setInternId(existing.intern_id);
    } else {
      // Fetch latest ID to auto suggest
      supabase.from('interns').select('intern_id').order('intern_id', { ascending: false }).limit(1)
        .then(({data}) => {
          if (data && data.length > 0 && data[0].intern_id.startsWith('INT')) {
            const num = parseInt(data[0].intern_id.replace('INT', ''), 10);
            if (!isNaN(num)) {
              setInternId(`INT${String(num + 1).padStart(3, '0')}`);
            } else {
              setInternId('INT001');
            }
          } else {
            setInternId('INT001');
          }
        });
      setPassword(generateRandomPassword());
    }
  }, [existing]);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    let expiryDate = null;
    if (expiryType !== 'never') {
      if (expiryType === 'custom') {
        expiryDate = new Date(customExpiry).toISOString();
      } else {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(expiryType, 10));
        expiryDate = d.toISOString();
      }
    }

    const payload = {
      intern_id: fd.get('intern_id'),
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      status: fd.get('status'),
      expiry_date: expiryDate
    };

    if (password) {
      payload.password_hash = await hashPassword(password);
    }

    if (existing) {
      const { error } = await supabase.from('interns').update(payload).eq('id', existing.id);
      if (error) { showToast(error.message, 'error'); return; }
      logActivity(null, 'Updated Intern', 'interns', existing.id, payload.intern_id);
      showToast('Intern account updated');
    } else {
      // Check duplicate
      const { data: dupCheck } = await supabase.from('interns').select('id').eq('intern_id', payload.intern_id);
      if (dupCheck && dupCheck.length > 0) {
        showToast('Error: User ID already exists.', 'error');
        return;
      }
      
      const { data, error } = await supabase.from('interns').insert([payload]).select().single();
      if (error) { showToast(error.message, 'error'); return; }
      
      if (prefilled) {
        await supabase.from('intern_applications').update({ status: 'Approved' }).eq('id', prefilled.id);
      }
      
      logActivity(null, 'Created Intern', 'interns', data.id, payload.intern_id);
      showToast('Intern account created successfully');
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={existing ? "Edit Intern Account" : "Create Intern Account"} maxWidth="max-w-xl">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1">User ID *</label><input name="intern_id" required value={internId} onChange={e => setInternId(e.target.value)} className="w-full border p-2 rounded text-sm bg-blue-50 font-bold" /></div>
          <div><label className="block text-sm mb-1">Full Name *</label><input name="name" required defaultValue={existing?.name || prefilled?.name} className="w-full border p-2 rounded text-sm" /></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1">Email</label><input type="email" name="email" defaultValue={existing?.email || prefilled?.email} className="w-full border p-2 rounded text-sm" /></div>
          <div><label className="block text-sm mb-1">Phone</label><input name="phone" defaultValue={existing?.phone || prefilled?.phone} className="w-full border p-2 rounded text-sm" /></div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">Password {existing && "(Leave blank to keep current)"}</label>
            <button type="button" onClick={() => setPassword(generateRandomPassword())} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium hover:bg-blue-200">
              Generate Random
            </button>
          </div>
          <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder={existing ? "Enter new password to change" : "Password"} required={!existing} className="w-full border p-2 rounded text-sm font-mono" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Account Expiry</label>
            <select value={expiryType} onChange={e => setExpiryType(e.target.value)} className="w-full border p-2 rounded text-sm">
              <option value="7">7 Days</option>
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="never">Never Expire</option>
              <option value="custom">Custom Date & Time</option>
            </select>
            {existing && existing.expiry_date && (
              <p className="text-xs text-gray-500 mt-1">Current: {new Date(existing.expiry_date).toLocaleString()}</p>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select name="status" defaultValue={existing?.status || 'Active'} className="w-full border p-2 rounded text-sm">
              {['Active', 'Suspended', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        
        {expiryType === 'custom' && (
          <div><label className="block text-sm mb-1">Custom Expiry Date</label><input type="datetime-local" value={customExpiry} onChange={e => setCustomExpiry(e.target.value)} required className="w-full border p-2 rounded text-sm" /></div>
        )}

        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-medium">Save Account</button>
      </form>
    </Modal>
  );
};

const InternTasksAdmin = () => {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  const [activeTab, setActiveTab] = useState('Tasks');

  const fetchTasks = async () => {
    const { data } = await supabase.from('intern_tasks').select('*').order('created_at', { ascending: false });
    setTasks(data || []);
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase.from('intern_submissions').select('*, interns(name, intern_id), intern_tasks(title)').order('submitted_at', { ascending: false });
    setSubmissions(data || []);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('intern_announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(data || []);
  };

  useEffect(() => {
    fetchTasks();
    fetchSubmissions();
    fetchAnnouncements();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const task = {
      title: fd.get('title'),
      description: fd.get('description'),
      deadline: fd.get('deadline') || null,
      document_url: fd.get('document_url')
    };
    await supabase.from('intern_tasks').insert([task]);
    e.target.reset();
    showToast('Task assigned to interns');
    fetchTasks();
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await supabase.from('intern_announcements').insert([{ title: fd.get('title'), content: fd.get('content') }]);
    e.target.reset();
    showToast('Announcement posted');
    fetchAnnouncements();
  };

  const updateSubmissionStatus = async (id, status) => {
    await supabase.from('intern_submissions').update({ status }).eq('id', id);
    fetchSubmissions();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Intern Tasks & Monitoring</h2>

      <div className="flex border-b mb-6">
        {['Tasks', 'Submissions', 'Announcements'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'Tasks' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-sm border h-fit">
              <h3 className="font-bold mb-4">Create New Task</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div><label className="block text-sm mb-1">Title *</label><input name="title" required className="w-full border p-2 rounded text-sm" /></div>
                <div><label className="block text-sm mb-1">Deadline</label><input type="datetime-local" name="deadline" className="w-full border p-2 rounded text-sm" /></div>
                <div><label className="block text-sm mb-1">Resource / Document URL</label><input name="document_url" type="url" className="w-full border p-2 rounded text-sm" /></div>
                <div><label className="block text-sm mb-1">Description</label><textarea name="description" rows="3" className="w-full border p-2 rounded text-sm"></textarea></div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium">Assign Task</button>
              </form>
            </div>
            <div className="md:col-span-2 space-y-4">
              {tasks.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-gray-900">{t.title}</h4>
                    <span className="text-sm text-gray-500">Deadline: {t.deadline ? new Date(t.deadline).toLocaleString() : 'No deadline'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{t.description}</p>
                  {t.document_url && <a href={t.document_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">View Resource Document</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Submissions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-medium text-gray-600">Intern</th>
                  <th className="p-4 font-medium text-gray-600">Task</th>
                  <th className="p-4 font-medium text-gray-600">Submission URL</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600">Time</th>
                  <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-4"><span className="font-medium">{s.interns?.name}</span> <span className="text-xs text-gray-500">({s.interns?.intern_id})</span></td>
                    <td className="p-4 text-sm">{s.intern_tasks?.title}</td>
                    <td className="p-4"><a href={s.submission_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate block w-48">{s.submission_url}</a></td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-medium ${s.status==='Reviewed' ? 'bg-green-100 text-green-700' : s.status==='Needs Revision' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{s.status}</span></td>
                    <td className="p-4 text-xs text-gray-500">{new Date(s.submitted_at).toLocaleString()}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => updateSubmissionStatus(s.id, 'Reviewed')} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded">Mark Reviewed</button>
                      <button onClick={() => updateSubmissionStatus(s.id, 'Needs Revision')} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded">Needs Revision</button>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && <tr><td colSpan="6" className="text-center p-8 text-gray-500">No submissions found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Announcements' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-sm border h-fit">
              <h3 className="font-bold mb-4">Post Announcement</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div><label className="block text-sm mb-1">Title *</label><input name="title" required className="w-full border p-2 rounded text-sm" /></div>
                <div><label className="block text-sm mb-1">Content *</label><textarea name="content" required rows="4" className="w-full border p-2 rounded text-sm"></textarea></div>
                <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded text-sm font-medium">Post to Interns</button>
              </form>
            </div>
            <div className="md:col-span-2 space-y-4">
              {announcements.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-purple-900 flex items-center gap-2"><Bell size={16}/> {a.title}</h4>
                    <span className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
