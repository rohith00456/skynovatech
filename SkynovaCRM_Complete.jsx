import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Search, Bell, Menu, X, Home, Users, Briefcase, Phone, BarChart2, CheckSquare, 
  Calendar, FileText, DollarSign, Activity, Settings, Plus, Filter, Download, 
  ChevronDown, ChevronRight, MoreVertical, Edit, Trash, Eye, CheckCircle, Clock, Save, RefreshCw, XCircle, LogOut
} from 'lucide-react';

const supabase = createClient(
  'https://wctbdqunrifopbnjisxi.supabase.co',
  'sb_publishable_q0VN3NfdSy8Gth-vH2eNeg_iUNNBX_x'
);

/*
-- USERS table (team members / CRM users)
create table users (
  id uuid primary key default gen_random_uuid(),
  name text, email text unique, phone text,
  role text, department text, status text,
  joining_date date, avatar_color text,
  created_at timestamp default now()
);

-- LEADS table
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text, email text, phone text, company text,
  source text, status text, priority text,
  owner_id uuid references users(id),
  lead_score int, expected_value numeric,
  location text, tags text[], notes text,
  last_contact_date date,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- CUSTOMERS table
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text, email text, phone text, company text,
  segment text, tags text[], status text,
  owner_id uuid references users(id),
  total_revenue numeric, location text, notes text,
  joining_date date,
  created_at timestamp default now()
);

-- CONTACTS table
create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text, email text, phone text, company text,
  type text, department text, tags text[],
  customer_id uuid references customers(id),
  notes text, last_activity_date date,
  created_at timestamp default now()
);

-- DEALS table (Sales Pipeline)
create table deals (
  id uuid primary key default gen_random_uuid(),
  name text, company text, value numeric,
  stage text, probability int,
  owner_id uuid references users(id),
  lead_id uuid references leads(id),
  customer_id uuid references customers(id),
  expected_close_date date, product_type text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- TASKS table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text, description text, status text,
  priority text, assignee_id uuid references users(id),
  related_module text, related_id uuid,
  due_date date, tags text[],
  created_by uuid references users(id),
  created_at timestamp default now()
);

-- FOLLOWUPS table
create table followups (
  id uuid primary key default gen_random_uuid(),
  type text, status text, outcome text,
  related_module text, related_id uuid,
  assigned_to uuid references users(id),
  scheduled_date date, scheduled_time time,
  notes text, reminder text,
  created_at timestamp default now()
);

-- QUOTATIONS table
create table quotations (
  id uuid primary key default gen_random_uuid(),
  quote_number text, customer_id uuid references customers(id),
  items jsonb, subtotal numeric, discount numeric,
  tax numeric, grand_total numeric,
  status text, expiry_date date,
  created_by uuid references users(id),
  created_at timestamp default now()
);

-- STIPENDS table
create table stipends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  project_name text, amount numeric,
  status text, role text, department text,
  stipend_date date, notes text,
  created_at timestamp default now()
);

-- ACTIVITIES table
create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text, module text, record_id uuid,
  record_name text, old_value text, new_value text,
  ip_address text,
  created_at timestamp default now()
);

-- NOTIFICATIONS table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  type text, message text, is_read boolean default false,
  related_module text, related_id uuid,
  created_at timestamp default now()
);

-- SAVED_FILTERS table
create table saved_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  module text, filter_name text, filter_data jsonb,
  created_at timestamp default now()
);
*/

// --- GLOBAL STATE & CONTEXT ---

// Simple toast implementation
let toastCount = 0;
const toastListeners = new Set();
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    const listener = (newToasts) => setToasts(newToasts);
    toastListeners.add(listener);
    return () => toastListeners.delete(listener);
  }, []);

  const showToast = (message, type = 'success') => {
    toastCount++;
    const id = toastCount;
    const newToast = { id, message, type };
    const currentToasts = [...toasts, newToast];
    toastListeners.forEach(listener => listener(currentToasts));
    
    setTimeout(() => {
      removeToast(id, currentToasts);
    }, 3000);
  };

  const removeToast = (id, currentList) => {
    const updatedToasts = currentList.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(updatedToasts));
  };

  return { toasts, showToast, removeToast };
};

export const showToast = (message, type = 'success') => {
    toastCount++;
    const id = toastCount;
    // We hack a bit to notify without context if called outside component
    // In a real app we'd use a robust toast library
    const event = new CustomEvent('skynova-toast', { detail: { id, message, type } });
    window.dispatchEvent(event);
};

// Log activity utility
const logActivity = async (userId, action, module, recordId, recordName, oldVal = null, newVal = null) => {
  try {
    await supabase.from('activities').insert([{
      user_id: userId, action, module, record_id: recordId, record_name: recordName,
      old_value: oldVal ? JSON.stringify(oldVal) : null,
      new_value: newVal ? JSON.stringify(newVal) : null
    }]);
  } catch (error) {
    console.error("Activity log error:", error);
  }
};

// Create notification utility
const createNotification = async (userId, type, message, relatedModule, relatedId) => {
  try {
    await supabase.from('notifications').insert([{
      user_id: userId, type, message, related_module: relatedModule, related_id: relatedId
    }]);
  } catch (error) {
    console.error("Notification error:", error);
  }
};

// --- SHARED UI COMPONENTS ---

const Spinner = ({ size = 24 }) => (
  <svg className="animate-spin text-blue-600" width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    const handleToast = (e) => {
      const { id, message, type } = e.detail;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    window.addEventListener('skynova-toast', handleToast);
    return () => window.removeEventListener('skynova-toast', handleToast);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-3 rounded shadow-lg text-white font-medium flex items-center gap-2 ${t.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {t.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {t.message}
        </div>
      ))}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Reusable Filter Panel Component
const FilterPanel = ({ isOpen, onClose, filters, setFilters, onApply, onReset, activeCount, modules = [] }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 border-l flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold flex items-center gap-2"><Filter size={18}/> Filters <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">{activeCount}</span></h3>
        <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-black"/></button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
        {/* Render dynamic filters based on passed config */}
        {Object.keys(filters).map(key => {
          // Simplistic rendering based on key names for demonstration
          if (['name', 'email', 'phone', 'company', 'location'].includes(key)) {
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{key}</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={filters[key]} onChange={e => setFilters({...filters, [key]: e.target.value})} placeholder={`Search ${key}...`} />
              </div>
            );
          }
          if (['status', 'priority', 'source'].includes(key)) {
             // In real app, we'd have predefined options passed in
             return (
               <div key={key}>
                 <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{key} (Comma separated)</label>
                 <input type="text" className="w-full border rounded p-2 text-sm" value={filters[key].join(',')} onChange={e => setFilters({...filters, [key]: e.target.value.split(',').filter(Boolean)})} placeholder={`e.g. New, Hot`} />
               </div>
             )
          }
          if (key === 'dateFrom' || key === 'dateTo') {
             return (
               <div key={key}>
                 <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{key === 'dateFrom' ? 'From Date' : 'To Date'}</label>
                 <input type="date" className="w-full border rounded p-2 text-sm" value={filters[key]} onChange={e => setFilters({...filters, [key]: e.target.value})} />
               </div>
             )
          }
          return null;
        })}
      </div>
      <div className="p-4 border-t flex gap-2">
        <button onClick={onReset} className="flex-1 py-2 border rounded text-gray-600 hover:bg-gray-50">Reset</button>
        <button onClick={onApply} className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Apply</button>
      </div>
    </div>
  );
};

// Sidebar Layout Component
const Sidebar = ({ currentRoute, setRoute }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'customers', label: 'Customers', icon: Briefcase },
    { id: 'contacts', label: 'Contacts', icon: Phone },
    { id: 'pipeline', label: 'Pipeline', icon: BarChart2 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'followups', label: 'Follow-Ups', icon: Calendar },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'stipends', label: 'Stipends', icon: DollarSign },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'reports', label: 'Reports', icon: BarChart },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#1e2a3a] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
          <Activity size={28} /> Skynova
        </h1>
        <p className="text-gray-400 text-sm mt-1">CRM Solutions</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setRoute(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#2a3b4e] hover:text-white'}`}
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-[#2a3b4e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold">
            U
          </div>
          <div className="text-sm">
            <p className="font-medium">Current User</p>
            <p className="text-gray-400 text-xs">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- MODULES ---

// 1. Dashboard
const Dashboard = () => {
  const [stats, setStats] = useState({ leads: 0, customers: 0, revenue: 0, activeDeals: 0, pendingFollowups: 0, conversionRate: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const sub = supabase.channel('realtime_activities')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, payload => {
        setRecentActivities(prev => [payload.new, ...prev].slice(0, 6));
      }).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [{ count: leadsCount }, { count: custCount }, { data: deals }, { count: followups }] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('deals').select('value, stage, name'),
        supabase.from('followups').select('*', { count: 'exact', head: true }).neq('status', 'Completed')
      ]);

      let totalRev = 0;
      let activeD = 0;
      deals?.forEach(d => {
        if (d.stage === 'Closed Won') totalRev += Number(d.value);
        else if (d.stage !== 'Closed Lost') activeD++;
      });

      setStats({
        leads: leadsCount || 0,
        customers: custCount || 0,
        revenue: totalRev,
        activeDeals: activeD,
        pendingFollowups: followups || 0,
        conversionRate: custCount && leadsCount ? Math.round((custCount / (leadsCount + custCount)) * 100) : 0
      });

      const { data: acts } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(6);
      setRecentActivities(acts || []);

      const { data: td } = await supabase.from('deals').select('name, value, company').order('value', { ascending: false }).limit(5);
      setTopDeals(td || []);

    } catch (e) {
      console.error(e);
      showToast('Error loading dashboard', 'error');
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8"><Spinner /></div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Leads', val: stats.leads, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Customers', val: stats.customers, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Revenue', val: `₹${stats.revenue.toLocaleString()}`, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Active Deals', val: stats.activeDeals, color: 'text-yellow-600', bg: 'bg-yellow-100' },
          { label: 'Follow-Ups', val: stats.pendingFollowups, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Conversion', val: `${stats.conversionRate}%`, color: 'text-teal-600', bg: 'bg-teal-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold mb-4">Top Deals</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="pb-2">Deal Name</th>
                  <th className="pb-2">Company</th>
                  <th className="pb-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {topDeals.map((d, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">{d.name}</td>
                    <td className="py-3 text-gray-600">{d.company}</td>
                    <td className="py-3 text-right font-medium">₹{d.value?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map(a => (
              <div key={a.id} className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                  <p className="text-sm"><span className="font-medium text-gray-900">{a.action}</span> - {a.record_name}</p>
                  <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Leads Module
const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 25;
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ name: '', email: '', phone: '', company: '', status: [], priority: [], source: [], tags: [], dateFrom: '', dateTo: '' });

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabase.from('leads').select('*, users(name)', { count: 'exact' });
    
    if (filters.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters.email) query = query.ilike('email', `%${filters.email}%`);
    if (filters.company) query = query.ilike('company', `%${filters.company}%`);
    if (filters.status.length) query = query.in('status', filters.status);
    if (filters.priority.length) query = query.in('priority', filters.priority);
    
    query = query.order('created_at', { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1);
    
    const { data, error, count } = await query;
    if (error) showToast('Error fetching leads', 'error');
    else {
      setLeads(data || []);
      setTotalCount(count);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [page]);

  const applyFilters = () => { setPage(0); fetchLeads(); setFilterOpen(false); };
  const resetFilters = () => { 
    setFilters({ name: '', email: '', phone: '', company: '', status: [], priority: [], source: [], tags: [], dateFrom: '', dateTo: '' });
    setPage(0);
    // Needs a small delay or use effect to fetch after reset
    setTimeout(fetchLeads, 0); 
  };

  const deleteLead = async (id, name) => {
    if (!confirm('Delete lead?')) return;
    await supabase.from('leads').delete().eq('id', id);
    await logActivity(null, 'Deleted Lead', 'lead', id, name);
    showToast('Lead deleted');
    fetchLeads();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Leads ({totalCount})</h2>
        <div className="flex gap-2">
          <button onClick={() => setFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      <FilterPanel 
        isOpen={isFilterOpen} onClose={() => setFilterOpen(false)} 
        filters={filters} setFilters={setFilters} 
        onApply={applyFilters} onReset={resetFilters} 
        activeCount={Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v !== '').length}
      />

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-600">Name</th>
                <th className="p-4 font-medium text-gray-600">Company</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
                <th className="p-4 font-medium text-gray-600">Owner</th>
                <th className="p-4 font-medium text-gray-600">Created</th>
                <th className="p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" className="text-center p-8"><Spinner /></td></tr> : 
               leads.map(lead => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500">{lead.email}</div>
                  </td>
                  <td className="p-4 text-gray-600">{lead.company}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{lead.status || 'New'}</span></td>
                  <td className="p-4 text-gray-600">{lead.users?.name || 'Unassigned'}</td>
                  <td className="p-4 text-gray-600 text-sm">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-2">
                    <button className="text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => deleteLead(lead.id, lead.name)} className="text-gray-400 hover:text-red-600"><Trash size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-600">Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50">Prev</button>
            <button disabled={(page + 1) * pageSize >= totalCount} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Customers Module
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCust = async () => {
      const { data } = await supabase.from('customers').select('*, users(name)').order('created_at', { ascending: false }).limit(50);
      setCustomers(data || []);
      setLoading(false);
    };
    fetchCust();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Add Customer
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? <Spinner /> : customers.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-lg">
                {c.name.charAt(0)}
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{c.status || 'Active'}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{c.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{c.company}</p>
            <div className="pt-3 border-t flex justify-between text-sm">
              <span className="text-gray-500">Revenue</span>
              <span className="font-medium">₹{(c.total_revenue || 0).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// 4. Contacts Module
const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase.from('contacts').select('*, customers(name)').order('created_at', { ascending: false }).limit(50);
      setContacts(data || []);
      setLoading(false);
    };
    fetchContacts();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Add Contact
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Customer</th>
              <th className="p-4 font-medium text-gray-600">Department</th>
              <th className="p-4 font-medium text-gray-600">Phone</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="text-center p-8"><Spinner /></td></tr> : 
             contacts.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.email}</div>
                </td>
                <td className="p-4 text-gray-600">{c.customers?.name || c.company}</td>
                <td className="p-4 text-gray-600">{c.department || '-'}</td>
                <td className="p-4 text-gray-600">{c.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. Sales Pipeline (Kanban)
const SalesPipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const stages = ['Lead In', 'Contact Made', 'Demo Scheduled', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase.from('deals').select('*, users(name), customers(name)').order('updated_at', { ascending: false });
      setDeals(data || []);
      setLoading(false);
    };
    fetchDeals();
  }, []);

  const moveDeal = async (id, newStage) => {
    setDeals(deals.map(d => d.id === id ? { ...d, stage: newStage } : d));
    await supabase.from('deals').update({ stage: newStage }).eq('id', id);
    showToast(`Deal moved to ${newStage}`);
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold">Sales Pipeline</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Add Deal
        </button>
      </div>
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {loading ? <div className="m-auto"><Spinner /></div> : stages.map(stage => (
          <div key={stage} className="w-80 shrink-0 bg-gray-50 rounded-xl flex flex-col h-full border">
            <div className="p-3 border-b flex justify-between items-center bg-gray-100 rounded-t-xl">
              <h3 className="font-semibold text-gray-700">{stage}</h3>
              <span className="bg-white text-gray-600 px-2 py-0.5 rounded-full text-xs shadow-sm">
                {deals.filter(d => d.stage === stage).length}
              </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {deals.filter(d => d.stage === stage).map(deal => (
                <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{deal.name}</h4>
                    <MoreVertical size={14} className="text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500 mb-3">{deal.customers?.name || deal.company}</div>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-green-600">₹{Number(deal.value).toLocaleString()}</span>
                    {/* Simulated Move Actions */}
                    <select 
                      className="text-xs border rounded p-1"
                      value={deal.stage}
                      onChange={(e) => moveDeal(deal.id, e.target.value)}
                    >
                      {stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. Tasks Module
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase.from('tasks').select('*, assignee:assignee_id(name)').order('due_date', { ascending: true });
      setTasks(data || []);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Add Task
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {loading ? <Spinner /> : tasks.length === 0 ? <p className="text-gray-500">No tasks found.</p> : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 border rounded-lg">
                <button onClick={() => toggleTask(task.id, task.status)} className="mt-0.5">
                  {task.status === 'Completed' ? <CheckCircle className="text-green-500" size={20} /> : <div className="w-5 h-5 border-2 rounded-full border-gray-300"></div>}
                </button>
                <div className="flex-1">
                  <h4 className={`font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    {task.due_date && <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(task.due_date).toLocaleDateString()}</span>}
                    {task.assignee?.name && <span className="flex items-center gap-1"><Users size={12}/> {task.assignee.name}</span>}
                    {task.priority && <span className={`px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{task.priority}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// 7. Follow-Ups Module
const FollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      const { data } = await supabase.from('followups').select('*, assigned_to(name)').order('scheduled_date', { ascending: true }).limit(50);
      setFollowups(data || []);
      setLoading(false);
    };
    fetchFollowups();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Follow-Ups</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Schedule
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <Spinner /> : followups.map(f => (
          <div key={f.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start">
            <div className={`p-3 rounded-lg ${f.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              <Calendar size={20} />
            </div>
            <div>
              <h4 className="font-semibold">{f.type || 'Meeting'}</h4>
              <p className="text-sm text-gray-600">Module: {f.related_module}</p>
              <p className="text-xs text-gray-500 mt-1">Date: {new Date(f.scheduled_date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. Quotations Module
const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data } = await supabase.from('quotations').select('*, customers(name)').order('created_at', { ascending: false });
      setQuotations(data || []);
      setLoading(false);
    };
    fetchQuotes();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quotations</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> New Quote
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">Quote #</th>
              <th className="p-4 font-medium text-gray-600">Customer</th>
              <th className="p-4 font-medium text-gray-600">Total</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="text-center p-8"><Spinner /></td></tr> : 
             quotations.map(q => (
              <tr key={q.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{q.quote_number}</td>
                <td className="p-4">{q.customers?.name}</td>
                <td className="p-4 font-semibold text-gray-900">₹{Number(q.grand_total).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${q.status === 'Draft' ? 'bg-gray-100' : q.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {q.status || 'Draft'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button className="text-gray-400 hover:text-blue-600"><Eye size={16} /></button>
                  <button className="text-gray-400 hover:text-blue-600"><Download size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 9. Stipends Module (Most Complete Module as requested)
const Stipends = () => {
  const [stipends, setStipends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ paid: 0, unpaid: 0, partial: 0 });
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ 
    search: '', project_name: '', status: [], role: [], department: [], dateFrom: '', dateTo: '', minAmount: '', maxAmount: '' 
  });
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedStipends, setSelectedStipends] = useState(new Set());

  const fetchStipends = async () => {
    setLoading(true);
    let query = supabase.from('stipends').select('*, users(name)');
    
    if (filters.search) query = query.ilike('users.name', `%${filters.search}%`);
    if (filters.project_name) query = query.ilike('project_name', `%${filters.project_name}%`);
    if (filters.status.length) query = query.in('status', filters.status);
    if (filters.role.length) query = query.in('role', filters.role);
    if (filters.department.length) query = query.in('department', filters.department);
    if (filters.minAmount) query = query.gte('amount', filters.minAmount);
    if (filters.maxAmount) query = query.lte('amount', filters.maxAmount);
    if (filters.dateFrom) query = query.gte('stipend_date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('stipend_date', filters.dateTo);

    const { data } = await query.order('stipend_date', { ascending: false });
    
    if (data) {
      setStipends(data);
      let p = 0, u = 0, pt = 0;
      data.forEach(s => {
        if (s.status === 'Paid') p += Number(s.amount);
        else if (s.status === 'Unpaid') u += Number(s.amount);
        else if (s.status === 'Partial') pt += Number(s.amount);
      });
      setSummary({ paid: p, unpaid: u, partial: pt });
    }
    setLoading(false);
  };

  useEffect(() => { fetchStipends(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('stipends').update({ status }).eq('id', id);
    showToast(`Status updated to ${status}`);
    fetchStipends();
  };

  const handleBulkPaid = async () => {
    if (selectedStipends.size === 0) return;
    const ids = Array.from(selectedStipends);
    await supabase.from('stipends').update({ status: 'Paid' }).in('id', ids);
    showToast(`${ids.length} stipends marked as Paid`);
    setSelectedStipends(new Set());
    fetchStipends();
  };

  const exportCSV = () => {
    const headers = ['ID', 'User', 'Project', 'Amount', 'Status', 'Date'];
    const csvData = stipends.map(s => [s.id, s.users?.name, s.project_name, s.amount, s.status, s.stipend_date].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stipends.csv';
    a.click();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Stipend Management</h2>
        <div className="flex gap-2">
          {selectedStipends.size > 0 && (
            <button onClick={handleBulkPaid} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <CheckCircle size={16} /> Mark Paid ({selectedStipends.size})
            </button>
          )}
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50">
            <Filter size={16} /> Filters
          </button>
          <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus size={16} /> Add Stipend
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-green-700">₹{summary.paid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
          <p className="text-sm text-gray-500">Total Unpaid</p>
          <p className="text-2xl font-bold text-red-700">₹{summary.unpaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-orange-500 shadow-sm">
          <p className="text-sm text-gray-500">Total Partial</p>
          <p className="text-2xl font-bold text-orange-700">₹{summary.partial.toLocaleString()}</p>
        </div>
      </div>

      <FilterPanel 
        isOpen={isFilterOpen} onClose={() => setFilterOpen(false)} 
        filters={filters} setFilters={setFilters} 
        onApply={() => { fetchStipends(); setFilterOpen(false); }} 
        onReset={() => { 
          setFilters({ search: '', project_name: '', status: [], role: [], department: [], dateFrom: '', dateTo: '', minAmount: '', maxAmount: '' });
          setTimeout(fetchStipends, 0);
        }} 
        activeCount={Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v !== '').length}
      />

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 w-12">
                  <input type="checkbox" onChange={e => {
                    if (e.target.checked) setSelectedStipends(new Set(stipends.map(s => s.id)));
                    else setSelectedStipends(new Set());
                  }} checked={selectedStipends.size === stipends.length && stipends.length > 0} />
                </th>
                <th className="p-4 font-medium text-gray-600">User</th>
                <th className="p-4 font-medium text-gray-600">Role & Dept</th>
                <th className="p-4 font-medium text-gray-600">Project</th>
                <th className="p-4 font-medium text-gray-600 text-right">Amount (₹)</th>
                <th className="p-4 font-medium text-gray-600">Date</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="7" className="text-center p-8"><Spinner /></td></tr> : 
               stipends.map(stip => (
                <tr key={stip.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedStipends.has(stip.id)} onChange={e => {
                      const newSet = new Set(selectedStipends);
                      if (e.target.checked) newSet.add(stip.id); else newSet.delete(stip.id);
                      setSelectedStipends(newSet);
                    }} />
                  </td>
                  <td className="p-4 font-medium">{stip.users?.name || 'Unknown'}</td>
                  <td className="p-4 text-sm text-gray-600">{stip.role} <br/> {stip.department}</td>
                  <td className="p-4 text-gray-600">{stip.project_name}</td>
                  <td className="p-4 text-right font-semibold">₹{Number(stip.amount).toLocaleString()}</td>
                  <td className="p-4 text-gray-600">{new Date(stip.stipend_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <select 
                      className={`text-xs rounded-full px-2 py-1 border-none font-medium ${
                        stip.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        stip.status === 'Unpaid' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}
                      value={stip.status}
                      onChange={e => updateStatus(stip.id, e.target.value)}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add Stipend">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Stipend creation logic would go here. Connected to Supabase insert.</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={() => setAddModalOpen(false)}>Save (Mock)</button>
        </div>
      </Modal>
    </div>
  );
};
// 10. Reports Module
const Reports = () => {
  // Simplified report charts using dummy data for structure but would be fetched via Supabase Promise.all
  const data = [
    { name: 'Jan', revenue: 4000, leads: 24 },
    { name: 'Feb', revenue: 3000, leads: 13 },
    { name: 'Mar', revenue: 2000, leads: 98 },
    { name: 'Apr', revenue: 2780, leads: 39 },
    { name: 'May', revenue: 1890, leads: 48 },
    { name: 'Jun', revenue: 2390, leads: 38 },
  ];
  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Lead Generation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="leads" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// 11. Activity Log
const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    supabase.from('activities').select('*, users(name)').order('created_at', { ascending: false }).limit(100)
      .then(({data}) => setActivities(data || []));
  }, []);
  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">Activity Log</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        {activities.map(a => (
          <div key={a.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg">
            <div className="mt-1"><Activity className="text-blue-500" size={18}/></div>
            <div>
              <p className="text-sm"><span className="font-medium">{a.users?.name || 'System'}</span> {a.action} <span className="font-medium">{a.record_name}</span> in module <span className="font-medium capitalize">{a.module}</span></p>
              <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP COMPONENT ---

export default function SkynovaCRM() {
  const [currentRoute, setRoute] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdmin(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (session) => {
    if (session) {
      const email = session.user?.email?.toLowerCase().trim();
      if (email !== 'rohithmech2006@gmail.com') {
        alert('Access Denied: Your email (' + email + ') is not authorized. Only rohithmech2006@gmail.com can log in.');
        await supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(session);
      }
    } else {
      setSession(null);
    }
    setAuthLoading(false);
  };

  // Example real-time notification subscription
  useEffect(() => {
    // Initial fetch
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false)
      .then(({count}) => setUnreadCount(count || 0));

    const sub = supabase.channel('realtime_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        setUnreadCount(prev => prev + 1);
      }).subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard': return <Dashboard />;
      case 'leads': return <Leads />;
      case 'customers': return <Customers />;
      case 'contacts': return <Contacts />;
      case 'pipeline': return <SalesPipeline />;
      case 'tasks': return <Tasks />;
      case 'followups': return <FollowUps />;
      case 'quotations': return <Quotations />;
      case 'stipends': return <Stipends />;
      case 'reports': return <Reports />;
      case 'activities': return <ActivityLog />;
      // Fallbacks for others
      case 'team': return <div className="p-6"><h2>Team Management (Not Implemented in Demo)</h2></div>;
      case 'notifications': return <div className="p-6"><h2>Notification Center</h2></div>;
      case 'settings': return <div className="p-6"><h2>Settings</h2></div>;
      default: return <Dashboard />;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center bg-[#f1f5f9]"><Spinner size={40} /></div>;

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f1f5f9] font-sans">
        <ToastContainer />
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full border border-gray-100">
          <div className="flex justify-center mb-6">
            <Activity size={48} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Skynova CRM</h1>
          <p className="text-gray-500 text-sm mb-8">Admin Access Only</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ 
              provider: 'google',
              options: {
                redirectTo: window.location.origin
              }
            })}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-gray-800 overflow-hidden">
      <ToastContainer />
      
      {/* Sidebar */}
      {isSidebarOpen && <Sidebar currentRoute={currentRoute} setRoute={setRoute} />}
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex justify-between items-center px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <Menu size={20} />
            </button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search everything (Ctrl+K)..." 
                className="pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 w-64 md:w-96 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-2 rounded-full border border-transparent hover:border-gray-200 transition-all">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold uppercase">
                {session.user.email.charAt(0)}
              </div>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
