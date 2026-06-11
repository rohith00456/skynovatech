$path = "E:\intern\skynovatech\SkynovaCRM_Complete.jsx"
$content = Get-Content $path -Raw

# 1. SQL TABLES
$sqlOld = "  converted_lead_id uuid references leads(id),`n  created_at timestamp default now()`n);`n*/"
$sqlNew = "  converted_lead_id uuid references leads(id),`n  created_at timestamp default now()`n);`n`n-- INTERNS table`ncreate table interns (`n  id uuid primary key default gen_random_uuid(),`n  intern_id text unique not null,`n  password_hash text not null,`n  name text not null,`n  email text,`n  phone text,`n  status text check (status in ('Active', 'Expired', 'Suspended', 'Completed')) default 'Active',`n  expiry_date timestamp,`n  created_at timestamp default now()`n);`n`n-- INTERN_APPLICATIONS table`ncreate table intern_applications (`n  id uuid primary key default gen_random_uuid(),`n  name text,`n  email text,`n  phone text,`n  resume_url text,`n  status text check (status in ('Pending', 'Approved', 'Rejected')) default 'Pending',`n  created_at timestamp default now()`n);`n`n-- INTERN_TASKS table`ncreate table intern_tasks (`n  id uuid primary key default gen_random_uuid(),`n  title text not null,`n  description text,`n  deadline timestamp,`n  document_url text,`n  created_at timestamp default now()`n);`n`n-- INTERN_SUBMISSIONS table`ncreate table intern_submissions (`n  id uuid primary key default gen_random_uuid(),`n  intern_id uuid references interns(id) on delete cascade,`n  task_id uuid references intern_tasks(id) on delete cascade,`n  submission_url text,`n  notes text,`n  status text check (status in ('Submitted', 'Reviewed', 'Needs Revision')) default 'Submitted',`n  submitted_at timestamp default now()`n);`n`n-- INTERN_ANNOUNCEMENTS table`ncreate table intern_announcements (`n  id uuid primary key default gen_random_uuid(),`n  title text not null,`n  content text,`n  created_at timestamp default now()`n);`n*/"
$content = $content.Replace($sqlOld, $sqlNew)

# 2. Inject React Modules before APP COMPONENT
$internAdmin = Get-Content "E:\intern\skynovatech\intern_admin_modules.jsx" -Raw
$internPortal = Get-Content "E:\intern\skynovatech\intern_portal_module.jsx" -Raw
$modulesBlock = "`n" + $internAdmin + "`n" + $internPortal + "`n// --- APP COMPONENT ---"
$content = $content.Replace("// --- APP COMPONENT ---", $modulesBlock)

# 3. Add to Sidebar
$sidebarOld = "{ id: 'projects', label: 'Projects', icon: Briefcase },"
$sidebarNew = "{ id: 'projects', label: 'Projects', icon: Briefcase },`n    { id: 'interns', label: 'Internships', icon: Users },`n    { id: 'intern_tasks', label: 'Intern Tasks', icon: CheckSquare },"
$content = $content.Replace($sidebarOld, $sidebarNew)

# 4. Add to renderContent
$renderOld = "case 'projects': return <Projects />;"
$renderNew = "case 'projects': return <Projects />;`n      case 'interns': return <InternsManagement />;`n      case 'intern_tasks': return <InternTasksAdmin />;"
$content = $content.Replace($renderOld, $renderNew)

# 5. Modify App State
$appStateOld = "const [authLoading, setAuthLoading] = useState(true);"
$appStateNew = "const [authLoading, setAuthLoading] = useState(true);`n  const [internSession, setInternSession] = useState(null);"
$content = $content.Replace($appStateOld, $appStateNew)

# 6. Modify useEffect for auth
$effectOld = "return () => subscription.unsubscribe();`n  }, []);"
$effectNew = "const storedIntern = localStorage.getItem('intern_session');`n    if (storedIntern) setInternSession(JSON.parse(storedIntern));`n`n    return () => subscription.unsubscribe();`n  }, []);"
$content = $content.Replace($effectOld, $effectNew)

# 7. Intern logout sync
$syncInternLogout = "useEffect(() => {`n    if (internSession) localStorage.setItem('intern_session', JSON.stringify(internSession));`n    else localStorage.removeItem('intern_session');`n  }, [internSession]);"
$content = $content.Replace("const checkAdmin = async", "$syncInternLogout`n`n  const checkAdmin = async")

Set-Content $path $content -NoNewline
