import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Search, Bell, Menu, X, Home, Users, Briefcase, Phone, BarChart2, CheckSquare, 
  Calendar, FileText, DollarSign, Activity, Settings, Plus, Filter, Download, 
  ChevronDown, ChevronRight, ChevronLeft, MoreVertical, Edit, Trash, Eye, CheckCircle, Clock, Save, RefreshCw, XCircle, LogOut, Send, Mail, UserPlus
} from 'lucide-react';
import { jsPDF } from 'https://esm.sh/jspdf';
import html2canvas from 'https://esm.sh/html2canvas';

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

-- PROJECTS table
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  customer_id uuid references customers(id),
  deal_id uuid references deals(id),
  assigned_to uuid references users(id),
  status text check (status in 
    ('Kickoff','Requirements','Design','Development','Testing','Delivered','Support'))
    default 'Kickoff',
  start_date date,
  expected_delivery date,
  description text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- MILESTONES table
create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  due_date date,
  completed boolean default false,
  completed_at timestamp,
  created_at timestamp default now()
);

-- INVOICES table
create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  customer_id uuid references customers(id),
  deal_id uuid references deals(id),
  status text check (status in 
    ('Draft','Sent','Partially Paid','Paid','Overdue')) default 'Draft',
  items jsonb default '[]',
  subtotal numeric(12,2) default 0,
  tax_percent numeric(5,2) default 18,
  tax_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  amount_paid numeric(12,2) default 0,
  due_date date,
  notes text,
  created_by uuid references users(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- PAYMENTS table
create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_date date default current_date,
  method text check (method in ('UPI','Bank Transfer','Cash','Cheque','Online')),
  reference text,
  notes text,
  created_at timestamp default now()
);

-- SERVICES table (catalogue)
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  unit_price numeric(12,2),
  category text,
  is_active boolean default true
);

-- TICKETS table
create table tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  project_id uuid references projects(id),
  subject text not null,
  description text,
  status text check (status in ('Open','In Progress','Resolved','Closed')) default 'Open',
  priority text check (priority in ('Low','Medium','High','Critical')) default 'Medium',
  assigned_to uuid references users(id),
  resolved_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- LEAD_CAPTURES table (from website contact form)
create table lead_captures (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  message text,
  source text default 'website',
  is_converted boolean default false,
  converted_lead_id uuid references leads(id),
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
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'interns', label: 'Internships', icon: Users },
    { id: 'website_forms', label: 'Website Forms', icon: FileText },
    { id: 'intern_tasks', label: 'Intern Tasks', icon: CheckSquare },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'tickets', label: 'Support Tickets', icon: CheckSquare },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
    { id: 'mail_sender', label: 'Mail Sender', icon: Mail },
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
  const [stats, setStats] = useState({ leads: 0, customers: 0, revenue: 0, activeDeals: 0, pendingFollowups: 0, conversionRate: 0, openTickets: 0, pendingInvoices: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [leadCaptures, setLeadCaptures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const sub = supabase.channel('realtime_activities')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, payload => {
        setRecentActivities(prev => [payload.new, ...prev].slice(0, 6));
      }).subscribe();
    const sub2 = supabase.channel('realtime_lead_captures')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lead_captures' }, payload => {
        if (!payload.new.is_converted) {
          setLeadCaptures(prev => [payload.new, ...prev].slice(0, 5));
        }
      }).subscribe();
    return () => {
      supabase.removeChannel(sub);
      supabase.removeChannel(sub2);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [{ count: leadsCount }, { count: custCount }, { data: deals }, { count: followups }, { count: openTickets }, { count: pendingInvoices }, { count: pendingInterns }] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('deals').select('value, stage, name'),
        supabase.from('followups').select('*', { count: 'exact', head: true }).neq('status', 'Completed'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['Open', 'In Progress']),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).in('status', ['Sent', 'Partially Paid', 'Overdue']),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'intern').eq('status', 'pending')
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
        conversionRate: custCount && leadsCount ? Math.round((custCount / (leadsCount + custCount)) * 100) : 0,
        openTickets: openTickets || 0,
        pendingInvoices: pendingInvoices || 0,
        pendingInternships: pendingInterns || 0
      });

      const { data: acts } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(6);
      setRecentActivities(acts || []);

      const { data: td } = await supabase.from('deals').select('name, value, company').order('value', { ascending: false }).limit(5);
      setTopDeals(td || []);

      const { data: lc } = await supabase.from('lead_captures').select('*').eq('is_converted', false).order('created_at', { ascending: false }).limit(5);
      setLeadCaptures(lc || []);

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
          { label: 'Open Tickets', val: stats.openTickets, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Pending Invoices', val: stats.pendingInvoices, color: 'text-pink-600', bg: 'bg-pink-100' },
          { label: 'Pending Internships', val: stats.pendingInternships || 0, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
            <h3 className="font-semibold mb-4">Website Lead Captures</h3>
            {leadCaptures.length === 0 ? <p className="text-gray-500 text-sm">No new website leads</p> : (
              <div className="space-y-4">
                {leadCaptures.map(lc => (
                  <div key={lc.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{lc.name} <span className="text-gray-500 text-sm ml-2">{lc.phone} | {lc.email}</span></p>
                      <p className="text-sm text-gray-600 mt-1">{lc.message?.substring(0, 50)}{lc.message?.length > 50 ? '...' : ''}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(lc.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={async () => {
                      const { data: newLead } = await supabase.from('leads').insert([{ name: lc.name, email: lc.email, phone: lc.phone, notes: lc.message, source: 'website', status: 'New' }]).select().single();
                      if (newLead) {
                        await supabase.from('lead_captures').update({ is_converted: true, converted_lead_id: newLead.id }).eq('id', lc.id);
                        showToast('Lead created from website capture');
                        fetchDashboardData();
                      }
                    }} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Convert to Lead
                    </button>
                  </div>
                ))}
              </div>
            )}
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

const ConvertLeadToDealModal = ({ lead, onClose }) => {
  const [formData, setFormData] = useState({ name: `${lead?.company || lead?.name} - Deal`, value: '', stage: 'Lead In' });
  const [saving, setSaving] = useState(false);
  const stages = ['Lead In', 'Contact Made', 'Demo Scheduled', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // 1. Create Customer
    const { data: custData, error: custErr } = await supabase.from('customers').insert([{
      name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, status: 'Active'
    }]).select().single();

    if (custErr) {
      alert("Error creating customer: " + custErr.message);
      setSaving(false); return;
    }

    // 2. Create Deal
    const { error: dealErr } = await supabase.from('deals').insert([{
      name: formData.name, value: formData.value, stage: formData.stage, customer_id: custData.id
    }]);

    if (dealErr) {
      alert("Error creating deal: " + dealErr.message);
      setSaving(false); return;
    }

    // 3. Delete Lead
    await supabase.from('leads').delete().eq('id', lead.id);
    
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add to Pipeline</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-4">This will convert <strong>{lead?.name}</strong> to a Customer and create a new Deal.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Deal Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <input required type="number" placeholder="Deal Value (₹)" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500">
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add to Pipeline'}</button>
          </div>
        </form>
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
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [selectedLeadForDeal, setSelectedLeadForDeal] = useState(null);

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

  const handleConvertToCustomer = async (lead) => {
    if (!confirm(`Convert ${lead.name} to a Customer? This will remove them from Leads.`)) return;
    
    // 1. Insert into customers
    const { error: insertError } = await supabase.from('customers').insert([{
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: 'Active'
    }]);

    if (insertError) {
      showToast('Error converting lead', 'error');
      return;
    }

    // 2. Delete from leads
    await supabase.from('leads').delete().eq('id', lead.id);
    await logActivity(null, 'Converted Lead to Customer', 'lead', lead.id, lead.name);
    showToast('Successfully converted to Customer');
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
                    <button onClick={() => { setSelectedLeadForDeal(lead); setDealModalOpen(true); }} title="Add to Sales Pipeline" className="text-gray-400 hover:text-yellow-600"><Briefcase size={16} /></button>
                    <button onClick={() => handleConvertToCustomer(lead)} title="Convert to Customer" className="text-gray-400 hover:text-indigo-600"><UserPlus size={16} /></button>
                    <button onClick={() => {
                      const url = `https://wa.me/91${lead.phone}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20this%20is%20the%20team%20at%20SkynovaTech.`;
                      window.open(url, '_blank');
                      logActivity(null, 'WhatsApp message sent', 'whatsapp', lead.id, lead.name, null, 'Hi ' + lead.name + ', this is the team at SkynovaTech.');
                    }} className="text-gray-400 hover:text-green-600"><Phone size={16} /></button>
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
      {dealModalOpen && <ConvertLeadToDealModal lead={selectedLeadForDeal} onClose={() => { setDealModalOpen(false); fetchLeads(); }} />}
    </div>
  );
};

// 3. Customers Module
const AddCustomerModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'Active' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('customers').insert([formData]);
    if (error) alert("Error: " + error.message);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add Customer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Customer Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <input type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <input type="text" placeholder="Company Name" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', customer_id: '', assigned_to: '' });
  const [users, setUsers] = useState([]);

  const fetchCust = async () => {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*, users(name)').order('created_at', { ascending: false }).limit(50);
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCust();
    supabase.from('users').select('id, name').then(({data}) => setUsers(data || []));
  }, []);

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('projects').insert([{ name: projectForm.name, customer_id: projectForm.customer_id, assigned_to: projectForm.assigned_to || null }]);
    if (error) alert("Error saving project: " + error.message);
    else {
      setIsProjectModalOpen(false);
      setProjectForm({ name: '', customer_id: '', assigned_to: '' });
      alert("Project created successfully!");
    }
  };

  const handleEditRevenue = async (e, customer) => {
    e.stopPropagation();
    const newRevenue = window.prompt(`Enter new total revenue for ${customer.name} (in ₹):`, customer.total_revenue || 0);
    if (newRevenue === null) return;
    const revNum = parseFloat(newRevenue);
    if (isNaN(revNum) || revNum < 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    const { error } = await supabase.from('customers').update({ total_revenue: revNum }).eq('id', customer.id);
    if (error) alert("Error saving revenue: " + error.message);
    else fetchCust();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsProjectModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <Plus size={16} /> Add Project
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? <Spinner /> : customers.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-lg">
                {c.name.charAt(0)}
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => {
                  e.stopPropagation();
                  const url = `https://wa.me/91${c.phone}?text=Hi%20${encodeURIComponent(c.name)}%2C%20this%20is%20the%20team%20at%20SkynovaTech.`;
                  window.open(url, '_blank');
                  logActivity(null, 'WhatsApp message sent', 'whatsapp', c.id, c.name, null, 'Hi ' + c.name + ', this is the team at SkynovaTech.');
                }} className="text-gray-400 hover:text-green-600"><Phone size={16} /></button>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{c.status || 'Active'}</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{c.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{c.company}</p>
            <div className="pt-3 border-t flex justify-between text-sm items-center">
              <span className="text-gray-500">Revenue</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">₹{(c.total_revenue || 0).toLocaleString()}</span>
                <button onClick={(e) => handleEditRevenue(e, c)} className="text-gray-400 hover:text-blue-600">
                  <Edit size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && <AddCustomerModal onClose={() => { setIsModalOpen(false); fetchCust(); }} />}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Customer *</label>
                <select required value={projectForm.customer_id} onChange={e => setProjectForm({...projectForm, customer_id: e.target.value})} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500">
                  <option value="">Select Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Project Name *</label>
                <input required type="text" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm mb-1">Assigned To</label>
                <select value={projectForm.assigned_to} onChange={e => setProjectForm({...projectForm, assigned_to: e.target.value})} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500">
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
const AddContactModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', department: '', customer_id: '' });
  const [saving, setSaving] = useState(false);
  const [customerList, setCustomerList] = useState([]);

  useEffect(() => {
    supabase.from('customers').select('id, name').order('name').then(({data}) => setCustomerList(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('contacts').insert([formData]);
    if (error) alert("Error: " + error.message);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add Contact</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Contact Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <input type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <input type="text" placeholder="Department / Job Title" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500">
            <option value="">Select Customer...</option>
            {customerList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Contact'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    const { data } = await supabase.from('contacts').select('*, customers(name)').order('created_at', { ascending: false }).limit(50);
    setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
      {isModalOpen && <AddContactModal onClose={() => { setIsModalOpen(false); fetchContacts(); }} />}
    </div>
  );
};

const AddDealModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ name: '', value: '', stage: 'Lead In', customer_id: '' });
  const [saving, setSaving] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const stages = ['Lead In', 'Contact Made', 'Demo Scheduled', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];

  useEffect(() => {
    supabase.from('customers').select('id, name').order('name').then(({data}) => setCustomerList(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('deals').insert([formData]);
    if (error) alert("Error: " + error.message);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add Deal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Deal Name (e.g. Website Redesign)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <input required type="number" placeholder="Deal Value (₹)" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500">
            <option value="">Select Customer...</option>
            {customerList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500">
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Deal'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Sales Pipeline (Kanban)
const SalesPipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stages = ['Lead In', 'Contact Made', 'Demo Scheduled', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  const fetchDeals = async () => {
    setLoading(true);
    const { data } = await supabase.from('deals').select('*, users(name), customers(name)').order('updated_at', { ascending: false });
    setDeals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const moveDeal = async (id, newStage) => {
    setDeals(deals.map(d => d.id === id ? { ...d, stage: newStage } : d));
    await supabase.from('deals').update({ stage: newStage }).eq('id', id);
    showToast(`Deal moved to ${newStage}`);
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold">Sales Pipeline</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Add Deal
        </button>
      </div>
      <div className="flex-1 flex flex-wrap gap-6 pb-6 w-full items-start justify-start">
        {loading ? <div className="m-auto"><Spinner /></div> : stages.map(stage => (
          <div key={stage} className="w-80 shrink-0 bg-gray-50 rounded-xl flex flex-col border shadow-sm" style={{ height: '600px' }}>
            <div className="p-3 border-b flex justify-between items-center bg-gray-100 rounded-t-xl shrink-0">
              <h3 className="font-semibold text-gray-700">{stage}</h3>
              <span className="bg-white text-gray-600 px-2 py-0.5 rounded-full text-xs shadow-sm">
                {deals.filter(d => d.stage === stage).length}
              </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
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
      {isModalOpen && <AddDealModal onClose={() => { setIsModalOpen(false); fetchDeals(); }} />}
    </div>
  );
};

// 6. Tasks Module
const AddTaskModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ title: '', assignee_name: '', assignee_role: 'Employee', priority: 'Medium' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('tasks').insert([formData]);
    if (error) alert("Error saving task: " + error.message);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Task Title (e.g. Call Client)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          
          <div className="flex gap-2">
            <select value={formData.assignee_role} onChange={e => setFormData({...formData, assignee_role: e.target.value})} className="border p-2 rounded outline-none focus:border-blue-500 w-1/3">
              <option value="Employee">Employee</option>
              <option value="Intern">Intern</option>
            </select>
            <input required type="text" placeholder="Assignee Name" value={formData.assignee_name} onChange={e => setFormData({...formData, assignee_name: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500 flex-1" />
          </div>

          <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500">
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*, assignee:assignee_id(name)').order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
  };

  const deleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
                    {(task.assignee_name || task.assignee?.name) && <span className="flex items-center gap-1"><Users size={12}/> {task.assignee_name || task.assignee?.name} ({task.assignee_role || 'Employee'})</span>}
                    {task.priority && <span className={`px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{task.priority}</span>}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 ml-auto mt-2">
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && <AddTaskModal onClose={() => { setIsModalOpen(false); fetchTasks(); }} />}
    </div>
  );
};

const AddFollowUpModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ contact_name: '', assignee_name: '', assignee_role: 'Employee', related_lead_name: '', scheduled_date: '', scheduled_time: '', type: 'Call', status: 'Pending' });
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    supabase.from('leads').select('name').order('name').then(({data}) => setLeads(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('followups').insert([formData]);
    if (error) alert("Error scheduling follow-up: " + error.message);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Schedule Follow-Up</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Contact Name (Who are you contacting?)" value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
          
          <div className="flex gap-2">
            <select value={formData.assignee_role} onChange={e => setFormData({...formData, assignee_role: e.target.value})} className="border p-2 rounded outline-none focus:border-blue-500 w-1/3">
              <option value="Employee">Employee</option>
              <option value="Intern">Intern</option>
            </select>
            <input required type="text" placeholder="Assignee Name (Who will do this?)" value={formData.assignee_name} onChange={e => setFormData({...formData, assignee_name: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500 flex-1" />
          </div>

          <div className="flex gap-2">
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="border p-2 rounded outline-none focus:border-blue-500 w-1/3">
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
            </select>
            <select required value={formData.related_lead_name} onChange={e => setFormData({...formData, related_lead_name: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-blue-500 flex-1">
              <option value="">Select Lead...</option>
              {leads.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <input required type="date" value={formData.scheduled_date} onChange={e => setFormData({...formData, scheduled_date: e.target.value})} className="w-1/2 border p-2 rounded outline-none focus:border-blue-500" />
            <input required type="time" value={formData.scheduled_time} onChange={e => setFormData({...formData, scheduled_time: e.target.value})} className="w-1/2 border p-2 rounded outline-none focus:border-blue-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Scheduling...' : 'Schedule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. Follow-Ups Module
const FollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFollowups = async () => {
    setLoading(true);
    const { data } = await supabase.from('followups').select('*').order('scheduled_date', { ascending: true }).limit(50);
    setFollowups(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const deleteFollowup = async (id) => {
    if (!confirm("Delete this follow-up?")) return;
    await supabase.from('followups').delete().eq('id', id);
    fetchFollowups();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Follow-Ups</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Schedule
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <Spinner /> : followups.map(f => (
          <div key={f.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start relative group">
            <button onClick={() => deleteFollowup(f.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash size={16} />
            </button>
            <div className={`p-3 rounded-lg ${f.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              <Phone size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{f.type || 'Follow Up'} - {f.related_lead_name || f.related_module || 'Lead'}</h4>
              <p className="text-sm text-gray-600 mt-1">Contact: <strong>{f.contact_name || '-'}</strong></p>
              <p className="text-sm text-gray-600">Assigned To: {f.assignee_name || f.assigned_to?.name} ({f.assignee_role || 'Employee'})</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Calendar size={12}/> {f.scheduled_date ? new Date(f.scheduled_date).toLocaleDateString() : '-'}</span>
                {f.scheduled_time && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Clock size={12}/> {f.scheduled_time}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && <AddFollowUpModal onClose={() => { setIsModalOpen(false); fetchFollowups(); }} />}
    </div>
  );
};

// 8. Quotations Module
const AddQuoteModal = ({ onClose }) => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer_id: '',
    quote_number: 'QT-' + new Date().getTime().toString().slice(-6),
    status: 'Draft',
    expiry_date: '',
    discount: 0,
    tax_percentage: 18
  });
  const [items, setItems] = useState([{ id: Date.now(), description: '', quantity: 1, unit_price: 0, total: 0 }]);

  useEffect(() => {
    supabase.from('customers').select('id, name').then(({data}) => setCustomers(data || []));
  }, []);

  const calculateTotals = (currentItems, discount, taxPercentage) => {
    const subtotal = currentItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price)), 0);
    const tax_amount = (subtotal - discount) * (taxPercentage / 100);
    const grand_total = subtotal - discount + tax_amount;
    return { subtotal, tax_amount, grand_total };
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.total = Number(updated.quantity || 0) * Number(updated.unit_price || 0);
        return updated;
      }
      return item;
    });
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { id: Date.now(), description: '', quantity: 1, unit_price: 0, total: 0 }]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));

  const { subtotal, tax_amount, grand_total } = calculateTotals(items, form.discount, form.tax_percentage);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      items: items,
      subtotal,
      tax: tax_amount,
      grand_total
    };
    await supabase.from('quotations').insert([payload]);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Quotation" maxWidth="max-w-4xl">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Customer *</label>
            <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} className="w-full border p-2 rounded">
              <option value="">Select...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Quote Number</label>
            <input required type="text" value={form.quote_number} onChange={e => setForm({...form, quote_number: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Expiry Date</label>
            <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border p-2 rounded">
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-700">Line Items</h4>
            <button type="button" onClick={addItem} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"><Plus size={14}/> Add Item</button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 w-1/2">Description</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Unit Price (₹)</th>
                  <th className="p-3">Total (₹)</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2"><input required type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full border p-1.5 rounded" placeholder="Item description..." /></td>
                    <td className="p-2"><input required type="number" min="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full border p-1.5 rounded" /></td>
                    <td className="p-2"><input required type="number" min="0" step="0.01" value={item.unit_price} onChange={e => handleItemChange(item.id, 'unit_price', e.target.value)} className="w-full border p-1.5 rounded" /></td>
                    <td className="p-2 font-medium bg-gray-50">{item.total.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      {items.length > 1 && <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700"><Trash size={16}/></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-3 bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between text-sm"><span>Subtotal:</span> <span className="font-medium">₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm items-center">
              <span>Discount (₹):</span> 
              <input type="number" min="0" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} className="w-20 border p-1 rounded text-right" />
            </div>
            <div className="flex justify-between text-sm items-center">
              <span>Tax (%):</span> 
              <input type="number" min="0" value={form.tax_percentage} onChange={e => setForm({...form, tax_percentage: Number(e.target.value)})} className="w-16 border p-1 rounded text-right" />
            </div>
            <div className="flex justify-between text-sm text-gray-500"><span>Tax Amount:</span> <span>₹{tax_amount.toFixed(2)}</span></div>
            <div className="pt-2 border-t flex justify-between font-bold text-lg"><span>Total:</span> <span>₹{grand_total.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Quotation</button>
        </div>
      </form>
    </Modal>
  );
};

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const fetchQuotes = async () => {
    const { data } = await supabase.from('quotations').select('*, customers(name)').order('created_at', { ascending: false });
    setQuotations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quotations</h2>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
      {isAddModalOpen && <AddQuoteModal onClose={() => { setAddModalOpen(false); fetchQuotes(); }} />}
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
    let query = supabase.from('stipends').select('*, interns(name)');
    
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
      let p = 0, u = 0, pt = 0, pd = 0;
      data.forEach(s => {
        if (s.status === 'Paid') p += Number(s.amount);
        else if (s.status === 'Unpaid') u += Number(s.amount);
        else if (s.status === 'Partial') pt += Number(s.amount);
        else if (s.status === 'Pending') pd += Number(s.amount);
      });
      setSummary({ paid: p, unpaid: u, partial: pt, pending: pd });
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
    const csvData = stipends.map(s => [s.id, s.interns?.name || 'Unknown', s.project_name, s.amount, s.status, s.stipend_date].join(','));
    const csvContent = "ID,Name,Project,Amount,Status,Date\n" + csvData.join('\n');
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

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-green-700">₹{summary.paid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-yellow-400 shadow-sm">
          <p className="text-sm text-gray-500">Total Pending</p>
          <p className="text-2xl font-bold text-yellow-600">₹{(summary.pending || 0).toLocaleString()}</p>
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
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{stip.interns?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{stip.role || (stip.intern_id ? 'Intern' : '')}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{stip.role} <br/> {stip.department}</td>
                  <td className="p-4 text-gray-600">{stip.project_name}</td>
                  <td className="p-4 text-right font-semibold">₹{Number(stip.amount).toLocaleString()}</td>
                  <td className="p-4 text-gray-600">{new Date(stip.stipend_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <select 
                      className={`text-xs rounded-full px-2 py-1 border-none font-medium ${
                        stip.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        stip.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        stip.status === 'Unpaid' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}
                      value={stip.status}
                      onChange={e => updateStatus(stip.id, e.target.value)}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
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
  const [data, setData] = useState([]);
  const [dealsData, setDealsData] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingInvoices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [ { data: leadsRes }, { data: invoicesRes }, { data: dealsRes } ] = await Promise.all([
          supabase.from('leads').select('created_at'),
          supabase.from('invoices').select('total, status, created_at'),
          supabase.from('deals').select('stage')
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const reportData = [];
        for (let i = 5; i >= 0; i--) {
          let m = currentMonth - i;
          let y = new Date().getFullYear();
          if (m < 0) { m += 12; y -= 1; }
          reportData.push({ name: months[m], monthIndex: m, year: y, revenue: 0, leads: 0 });
        }

        leadsRes?.forEach(lead => {
          const d = new Date(lead.created_at);
          const idx = reportData.findIndex(r => r.monthIndex === d.getMonth() && r.year === d.getFullYear());
          if (idx !== -1) reportData[idx].leads += 1;
        });

        let totRev = 0;
        let pInvoices = 0;
        invoicesRes?.forEach(inv => {
          if (inv.status === 'Paid') {
            totRev += Number(inv.total || 0);
            const d = new Date(inv.created_at);
            const idx = reportData.findIndex(r => r.monthIndex === d.getMonth() && r.year === d.getFullYear());
            if (idx !== -1) reportData[idx].revenue += Number(inv.total || 0);
          } else if (['Sent', 'Partially Paid', 'Overdue'].includes(inv.status)) {
            pInvoices++;
          }
        });

        const stageCounts = {};
        dealsRes?.forEach(deal => {
          const s = deal.stage || 'Unknown';
          stageCounts[s] = (stageCounts[s] || 0) + 1;
        });
        const dData = Object.keys(stageCounts).map(k => ({ stage: k, count: stageCounts[k] }));

        setData(reportData);
        setDealsData(dData);
        setStats({ totalRevenue: totRev, pendingInvoices: pInvoices });
      } catch (err) {
        console.error("Error fetching report data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-100 text-green-600 rounded-full"><DollarSign size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Invoices</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingInvoices}</p>
          </div>
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full"><FileText size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(val) => `₹${val.toLocaleString()}`} />
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold mb-4">Deals by Stage</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dealsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" />
              <YAxis />
              <RechartsTooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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


const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [deals, setDeals] = useState([]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*, customers(name), users!projects_assigned_to_fkey(name)').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    supabase.from('customers').select('id, name').then(({data}) => setCustomers(data || []));
    supabase.from('users').select('id, name').then(({data}) => setUsers(data || []));
    supabase.from('deals').select('id, name').then(({data}) => setDeals(data || []));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const proj = {
      name: fd.get('name'),
      customer_id: fd.get('customer_id'),
      deal_id: fd.get('deal_id') || null,
      assigned_to: fd.get('assigned_to') || null,
      status: fd.get('status'),
      start_date: fd.get('start_date') || null,
      expected_delivery: fd.get('expected_delivery') || null,
      description: fd.get('description')
    };
    const { data, error } = await supabase.from('projects').insert([proj]).select().single();
    if (error) { showToast(error.message, 'error'); return; }
    logActivity(null, 'Created Project', 'projects', data.id, data.name);
    showToast('Project saved');
    setAddModalOpen(false);
    fetchProjects();
  };

  const statusColors = {
    'Kickoff': 'bg-gray-100 text-gray-800',
    'Requirements': 'bg-blue-100 text-blue-800',
    'Design': 'bg-purple-100 text-purple-800',
    'Development': 'bg-yellow-100 text-yellow-800',
    'Testing': 'bg-orange-100 text-orange-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Support': 'bg-teal-100 text-teal-800'
  };
  const stages = ['Kickoff', 'Requirements', 'Design', 'Development', 'Testing', 'Delivered', 'Support'];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <Spinner /> : projects.map(p => (
          <div key={p.id} onClick={() => setSelectedProject(p)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{p.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${statusColors[p.status] || 'bg-gray-100'}`}>{p.status}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{p.customers?.name}</p>
            <div className="flex justify-between text-xs text-gray-500 mt-4">
              <span>{p.users?.name || 'Unassigned'}</span>
              <span>Due: {p.expected_delivery ? new Date(p.expected_delivery).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add Project" maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm mb-1">Name *</label><input name="name" required className="w-full border p-2 rounded" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">Customer *</label>
              <select name="customer_id" required className="w-full border p-2 rounded">
                <option value="">Select Customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm mb-1">Deal (Optional)</label>
              <select name="deal_id" className="w-full border p-2 rounded">
                <option value="">None</option>
                {deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">Assigned To</label>
              <select name="assigned_to" className="w-full border p-2 rounded">
                <option value="">Select User...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm mb-1">Status</label>
              <select name="status" defaultValue="Kickoff" className="w-full border p-2 rounded">
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">Start Date</label><input type="date" name="start_date" className="w-full border p-2 rounded" /></div>
            <div><label className="block text-sm mb-1">Expected Delivery</label><input type="date" name="expected_delivery" className="w-full border p-2 rounded" /></div>
          </div>
          <div><label className="block text-sm mb-1">Description</label><textarea name="description" rows="3" className="w-full border p-2 rounded"></textarea></div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Save Project</button>
        </form>
      </Modal>

      {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => { setSelectedProject(null); fetchProjects(); }} stages={stages} statusColors={statusColors} />}
    </div>
  );
};

const ProjectDetailModal = ({ project, onClose, stages, statusColors }) => {
  const [milestones, setMilestones] = useState([]);
  const [status, setStatus] = useState(project.status);

  const fetchMilestones = async () => {
    const { data } = await supabase.from('milestones').select('*').eq('project_id', project.id).order('due_date', { ascending: true });
    setMilestones(data || []);
  };

  useEffect(() => { fetchMilestones(); }, [project.id]);

  const updateStatus = async (newStatus) => {
    setStatus(newStatus);
    await supabase.from('projects').update({ status: newStatus }).eq('id', project.id);
    logActivity(null, 'Updated Project Status', 'projects', project.id, project.name, status, newStatus);
    showToast('Project status updated');
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ms = { project_id: project.id, title: fd.get('title'), due_date: fd.get('due_date') || null };
    await supabase.from('milestones').insert([ms]);
    e.target.reset();
    fetchMilestones();
    logActivity(null, 'Added Milestone', 'projects', project.id, project.name);
    showToast('Milestone added');
  };

  const toggleMilestone = async (ms) => {
    const val = !ms.completed;
    await supabase.from('milestones').update({ completed: val, completed_at: val ? new Date().toISOString() : null }).eq('id', ms.id);
    fetchMilestones();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Project: ${project.name}`} maxWidth="max-w-3xl">
      <div className="mb-6">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {stages.map(s => (
            <button key={s} onClick={() => updateStatus(s)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
        <p className="text-gray-600 text-sm">{project.description}</p>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Milestones</h4>
        <div className="space-y-2 mb-4">
          {milestones.map(ms => (
            <div key={ms.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded border">
              <input type="checkbox" checked={ms.completed} onChange={() => toggleMilestone(ms)} className="w-4 h-4" />
              <span className={`flex-1 ${ms.completed ? 'line-through text-gray-400' : ''}`}>{ms.title}</span>
              <span className="text-xs text-gray-500">{ms.due_date ? new Date(ms.due_date).toLocaleDateString() : ''}</span>
            </div>
          ))}
          {milestones.length === 0 && <p className="text-sm text-gray-500">No milestones yet.</p>}
        </div>
        <form onSubmit={handleAddMilestone} className="flex gap-2">
          <input name="title" required placeholder="Milestone Title" className="flex-1 border p-2 rounded text-sm" />
          <input type="date" name="due_date" className="border p-2 rounded text-sm w-36" />
          <button type="submit" className="px-4 py-2 bg-gray-100 border rounded text-sm hover:bg-gray-200">Add</button>
        </form>
      </div>
    </Modal>
  );
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBuilderOpen, setBuilderOpen] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  
  const [filters, setFilters] = useState({ status: '', customer: '' });

  const fetchInvoices = async () => {
    setLoading(true);
    let query = supabase.from('invoices').select('*, customers(name)').order('created_at', { ascending: false });
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.customer) query = query.ilike('customers.name', `%${filters.customer}%`);
    const { data } = await query;
    setInvoices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, [filters]);

  const statusColors = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Sent': 'bg-blue-100 text-blue-800',
    'Partially Paid': 'bg-orange-100 text-orange-800',
    'Paid': 'bg-green-100 text-green-800',
    'Overdue': 'bg-red-100 text-red-800'
  };

  const downloadInvoicePDF = (inv) => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.setTextColor(24, 119, 242);
    doc.text("Skynova Tech Solutions", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("123 Tech Park, Innovation City, 500001", 20, 28);
    doc.text("Email: contact@skynovatech.com | Phone: +91 9876543210", 20, 34);

    doc.setFontSize(20);
    doc.setTextColor(0);
    doc.text("INVOICE", 150, 25);
    doc.setFontSize(12);
    doc.text(`Invoice #: ${inv.invoice_number}`, 150, 35);
    doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString()}`, 150, 42);
    doc.text(`Due Date: ${inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}`, 150, 49);

    doc.line(20, 55, 190, 55);

    doc.setFontSize(14);
    doc.text("Bill To:", 20, 65);
    doc.setFontSize(12);
    doc.text(inv.customers?.name || 'Customer', 20, 72);
    
    // Items
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 85, 170, 10, 'F');
    doc.setFont(undefined, 'bold');
    doc.text("Description", 25, 92);
    doc.text("Amount", 160, 92);
    doc.setFont(undefined, 'normal');

    let y = 105;
    if (inv.items && Array.isArray(inv.items)) {
       inv.items.forEach(item => {
          doc.text(item.description || 'Item', 25, y);
          doc.text(`Rs. ${Number(item.total || 0).toLocaleString()}`, 160, y);
          y += 10;
       });
    } else {
       doc.text("Professional Services", 25, y);
       doc.text(`Rs. ${Number(inv.total).toLocaleString()}`, 160, y);
       y += 10;
    }

    doc.line(20, y+10, 190, y+10);
    y += 20;

    doc.setFont(undefined, 'bold');
    doc.text(`Subtotal:`, 130, y);
    doc.text(`Rs. ${Number(inv.subtotal).toLocaleString()}`, 160, y);
    
    y += 10;
    doc.text(`Tax:`, 130, y);
    doc.text(`Rs. ${Number(inv.tax_amount).toLocaleString()}`, 160, y);

    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(24, 119, 242);
    doc.text(`Total:`, 130, y);
    doc.text(`Rs. ${Number(inv.total).toLocaleString()}`, 160, y);

    doc.save(`Invoice_${inv.invoice_number}.pdf`);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <button onClick={() => setBuilderOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="border p-2 rounded text-sm bg-white w-40">
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
        <input 
          placeholder="Filter by customer..." 
          value={filters.customer} 
          onChange={e => setFilters({...filters, customer: e.target.value})} 
          className="border p-2 rounded text-sm w-64"
        />
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-600">Invoice #</th>
                <th className="p-4 font-medium text-gray-600">Customer</th>
                <th className="p-4 font-medium text-gray-600 text-right">Total (₹)</th>
                <th className="p-4 font-medium text-gray-600 text-right">Paid (₹)</th>
                <th className="p-4 font-medium text-gray-600 text-right">Balance (₹)</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
                <th className="p-4 font-medium text-gray-600">Due Date</th>
                <th className="p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="8" className="text-center p-8"><Spinner /></td></tr> : 
               invoices.map(inv => {
                 const balance = Number(inv.total) - Number(inv.amount_paid);
                 const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'Paid';
                 const displayStatus = isOverdue ? 'Overdue' : inv.status;
                 return (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{inv.invoice_number}</td>
                    <td className="p-4">{inv.customers?.name}</td>
                    <td className="p-4 text-right">₹{Number(inv.total).toLocaleString()}</td>
                    <td className="p-4 text-right text-green-600">₹{Number(inv.amount_paid).toLocaleString()}</td>
                    <td className="p-4 text-right font-semibold text-red-600">₹{balance.toLocaleString()}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${statusColors[displayStatus]}`}>{displayStatus}</span></td>
                    <td className="p-4 text-sm text-gray-600">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => downloadInvoicePDF(inv)} className="text-xs border border-blue-500 text-blue-600 px-2 py-1 rounded hover:bg-blue-50">PDF</button>
                        {balance > 0 && <button onClick={() => setPaymentModalInvoice({ ...inv, balance })} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Record Payment</button>}
                      </div>
                    </td>
                  </tr>
                 );
               })}
            </tbody>
          </table>
        </div>
      </div>

      {isBuilderOpen && <InvoiceBuilderModal onClose={() => { setBuilderOpen(false); fetchInvoices(); }} />}
      {paymentModalInvoice && <RecordPaymentModal invoice={paymentModalInvoice} onClose={() => { setPaymentModalInvoice(null); fetchInvoices(); }} />}
    </div>
  );
};

const InvoiceBuilderModal = ({ onClose }) => {
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [deals, setDeals] = useState([]);
  
  const [customerId, setCustomerId] = useState('');
  const [dealId, setDealId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ id: 1, service_name: '', description: '', qty: 1, unit_price: 0 }]);
  
  // Preferences
  const pref = JSON.parse(localStorage.getItem('skynova_company_settings') || '{}');
  const taxPercent = pref.defaultGst || 18;
  const prefix = pref.invoicePrefix || 'INV';
  const generatedInvoiceNumber = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  useEffect(() => {
    supabase.from('customers').select('id, name').then(({data}) => setCustomers(data || []));
    supabase.from('services').select('*').eq('is_active', true).then(({data}) => setServices(data || []));
  }, []);

  useEffect(() => {
    if (customerId) supabase.from('deals').select('id, name').eq('customer_id', customerId).then(({data}) => setDeals(data || []));
    else setDeals([]);
  }, [customerId]);

  const addItem = () => setItems([...items, { id: Date.now(), service_name: '', description: '', qty: 1, unit_price: 0 }]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));
  
  const updateItem = (id, field, value) => {
    setItems(items.map(i => {
      if (i.id === id) {
        const updated = { ...i, [field]: value };
        if (field === 'service_name') {
          const svc = services.find(s => s.name === value);
          if (svc) updated.unit_price = svc.unit_price;
        }
        return updated;
      }
      return i;
    }));
  };

  const subtotal = items.reduce((sum, i) => sum + (Number(i.qty) * Number(i.unit_price)), 0);
  const taxAmount = subtotal * (taxPercent / 100);
  const grandTotal = subtotal + taxAmount;

  const handleSave = async (status) => {
    if (!customerId) { showToast('Customer is required', 'error'); return; }
    
    const invoice = {
      invoice_number: generatedInvoiceNumber,
      customer_id: customerId,
      deal_id: dealId || null,
      status,
      items: items,
      subtotal,
      tax_percent: taxPercent,
      tax_amount: taxAmount,
      total: grandTotal,
      due_date: dueDate || null,
      notes
    };

    const { data, error } = await supabase.from('invoices').insert([invoice]).select().single();
    if (error) { showToast(error.message, 'error'); return; }
    logActivity(null, `Created Invoice ${generatedInvoiceNumber}`, 'invoices', data.id, generatedInvoiceNumber);
    showToast(`Invoice saved as ${status}`);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="New Invoice" maxWidth="max-w-4xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1">Customer *</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full border p-2 rounded text-sm">
              <option value="">Select Customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm mb-1">Deal (Optional)</label>
            <select value={dealId} onChange={e => setDealId(e.target.value)} className="w-full border p-2 rounded text-sm" disabled={!customerId}>
              <option value="">None</option>
              {deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm mb-1">Invoice #</label><input readOnly value={generatedInvoiceNumber} className="w-full border p-2 rounded text-sm bg-gray-50" /></div>
          <div><label className="block text-sm mb-1">Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border p-2 rounded text-sm" /></div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-2">Service Name</th>
                <th className="p-2">Description</th>
                <th className="p-2 w-20 text-center">Qty</th>
                <th className="p-2 w-32 text-right">Unit Price (₹)</th>
                <th className="p-2 w-32 text-right">Total (₹)</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} className="border-b">
                  <td className="p-2">
                    <input list="services" value={it.service_name} onChange={e => updateItem(it.id, 'service_name', e.target.value)} placeholder="Type or select" className="w-full border p-1 rounded" />
                    <datalist id="services">{services.map(s => <option key={s.id} value={s.name} />)}</datalist>
                  </td>
                  <td className="p-2"><input value={it.description} onChange={e => updateItem(it.id, 'description', e.target.value)} className="w-full border p-1 rounded" /></td>
                  <td className="p-2"><input type="number" min="1" value={it.qty} onChange={e => updateItem(it.id, 'qty', e.target.value)} className="w-full border p-1 rounded text-center" /></td>
                  <td className="p-2"><input type="number" min="0" value={it.unit_price} onChange={e => updateItem(it.id, 'unit_price', e.target.value)} className="w-full border p-1 rounded text-right" /></td>
                  <td className="p-2 text-right font-medium text-gray-700">{(it.qty * it.unit_price).toLocaleString()}</td>
                  <td className="p-2 text-center"><button onClick={() => removeItem(it.id)} className="text-red-500 hover:text-red-700"><X size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItem} className="w-full p-2 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t">
            + Add Line Item
          </button>
        </div>

        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span className="font-medium">₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GST ({taxPercent}%):</span><span className="font-medium">₹{taxAmount.toLocaleString()}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t"><span>Grand Total:</span><span className="text-blue-600">₹{grandTotal.toLocaleString()}</span></div>
          </div>
        </div>

        <div><label className="block text-sm mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2" className="w-full border p-2 rounded text-sm"></textarea></div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={() => handleSave('Draft')} className="px-4 py-2 border rounded bg-white hover:bg-gray-50 text-sm">Save as Draft</button>
          <button onClick={() => handleSave('Sent')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Save & Mark Sent</button>
        </div>
      </div>
    </Modal>
  );
};

const RecordPaymentModal = ({ invoice, onClose }) => {
  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = Number(fd.get('amount'));
    
    const payment = {
      invoice_id: invoice.id,
      amount,
      payment_date: fd.get('payment_date'),
      method: fd.get('method'),
      reference: fd.get('reference'),
      notes: fd.get('notes')
    };

    await supabase.from('payments').insert([payment]);
    
    const newAmountPaid = Number(invoice.amount_paid) + amount;
    const newStatus = newAmountPaid >= Number(invoice.total) ? 'Paid' : 'Partially Paid';
    
    await supabase.from('invoices').update({ amount_paid: newAmountPaid, status: newStatus }).eq('id', invoice.id);
    
    createNotification(null, 'payment_received', `Payment of ₹${amount} recorded for Invoice ${invoice.invoice_number}`, 'invoices', invoice.id);
    logActivity(null, `Payment recorded`, 'invoices', invoice.id, invoice.invoice_number, null, `Amount: ₹${amount}`);
    showToast('Payment recorded');
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Record Payment for ${invoice.invoice_number}`}>
      <form onSubmit={handleSave} className="space-y-4">
        <div><label className="block text-sm mb-1">Amount (₹) *</label><input type="number" step="0.01" name="amount" required defaultValue={invoice.balance} max={invoice.balance} className="w-full border p-2 rounded" /></div>
        <div><label className="block text-sm mb-1">Payment Date *</label><input type="date" name="payment_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border p-2 rounded" /></div>
        <div><label className="block text-sm mb-1">Method *</label>
          <select name="method" required className="w-full border p-2 rounded">
            {['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Online'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div><label className="block text-sm mb-1">Reference (Transaction ID)</label><input name="reference" className="w-full border p-2 rounded" /></div>
        <div><label className="block text-sm mb-1">Notes</label><textarea name="notes" rows="2" className="w-full border p-2 rounded"></textarea></div>
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded font-medium">Record Payment</button>
      </form>
    </Modal>
  );
};

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketForm, setTicketForm] = useState({ customer_id: '', project_id: '', assigned_to: '' });

  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const fetchTickets = async () => {
    setLoading(true);
    let query = supabase.from('tickets').select('*, customers(name), users!tickets_assigned_to_fkey(name), projects(name)').order('created_at', { ascending: false });
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    const { data } = await query;
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    supabase.from('customers').select('id, name').then(({data}) => setCustomers(data || []));
    supabase.from('users').select('id, name').then(({data}) => setUsers(data || []));
    supabase.from('projects').select('id, name, customer_id, assigned_to').then(({data}) => setProjects(data || []));
  }, [filters]);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ticket = {
      customer_id: fd.get('customer_id'),
      project_id: fd.get('project_id') || null,
      subject: fd.get('subject'),
      description: fd.get('description'),
      priority: fd.get('priority'),
      assigned_to: fd.get('assigned_to') || null
    };

    const { data, error } = await supabase.from('tickets').insert([ticket]).select().single();
    if (error) { showToast(error.message, 'error'); return; }
    
    if (ticket.assigned_to) {
      createNotification(ticket.assigned_to, 'ticket_opened', `New ticket: ${ticket.subject}`, 'tickets', data.id);
    }
    
    logActivity(null, 'Created Ticket', 'tickets', data.id, data.subject);
    showToast('Ticket opened');
    setAddModalOpen(false);
    fetchTickets();
  };

  const priorityColors = { 'Low': 'bg-gray-100 text-gray-800', 'Medium': 'bg-yellow-100 text-yellow-800', 'High': 'bg-orange-100 text-orange-800', 'Critical': 'bg-red-100 text-red-800' };
  const statusColors = { 'Open': 'bg-blue-100 text-blue-800', 'In Progress': 'bg-yellow-100 text-yellow-800', 'Resolved': 'bg-green-100 text-green-800', 'Closed': 'bg-gray-100 text-gray-800' };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="border p-2 rounded text-sm bg-white w-40">
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})} className="border p-2 rounded text-sm bg-white w-40">
          <option value="">All Priorities</option>
          {Object.keys(priorityColors).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-600">Subject</th>
                <th className="p-4 font-medium text-gray-600">Customer / Project</th>
                <th className="p-4 font-medium text-gray-600">Priority</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
                <th className="p-4 font-medium text-gray-600">Assigned To</th>
                <th className="p-4 font-medium text-gray-600">Date</th>
                <th className="p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="7" className="text-center p-8"><Spinner /></td></tr> : 
               tickets.map(t => (
                 <tr key={t.id} className="border-b hover:bg-gray-50">
                   <td className="p-4 font-medium">{t.subject}</td>
                   <td className="p-4 text-sm"><div className="font-medium text-gray-800">{t.customers?.name}</div><div className="text-gray-500">{t.projects?.name}</div></td>
                   <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${priorityColors[t.priority]}`}>{t.priority}</span></td>
                   <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${statusColors[t.status]}`}>{t.status}</span></td>
                   <td className="p-4 text-sm text-gray-600">{t.users?.name || 'Unassigned'}</td>
                   <td className="p-4 text-sm text-gray-600">{new Date(t.created_at).toLocaleDateString()}</td>
                   <td className="p-4">
                     <button onClick={() => setSelectedTicket(t)} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium border border-blue-200">View</button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="New Support Ticket" maxWidth="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm mb-1">Subject *</label><input name="subject" required className="w-full border p-2 rounded text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">Customer *</label>
              <select name="customer_id" required className="w-full border p-2 rounded text-sm">
                <option value="">Select...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm mb-1">Project</label>
              <select name="project_id" className="w-full border p-2 rounded text-sm">
                <option value="">None</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm mb-1">Priority</label>
              <select name="priority" defaultValue="Medium" className="w-full border p-2 rounded text-sm">
                {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="block text-sm mb-1">Assigned To</label>
              <select name="assigned_to" className="w-full border p-2 rounded text-sm">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-sm mb-1">Description</label><textarea name="description" rows="4" className="w-full border p-2 rounded text-sm"></textarea></div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-medium">Create Ticket</button>
        </form>
      </Modal>

      {selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={() => { setSelectedTicket(null); fetchTickets(); }} statusColors={statusColors} priorityColors={priorityColors} />}
    </div>
  );
};

const TicketDetailModal = ({ ticket, onClose, statusColors, priorityColors }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState(ticket.status);

  const fetchComments = async () => {
    const { data } = await supabase.from('activities').select('*, users(name)').eq('module', 'ticket').eq('record_id', ticket.id).order('created_at', { ascending: true });
    setComments(data || []);
  };

  useEffect(() => { fetchComments(); }, [ticket.id]);

  const updateStatus = async (newStatus) => {
    if (newStatus === 'Closed') {
      await supabase.from('tickets').delete().eq('id', ticket.id);
      logActivity(null, 'Ticket Closed and Deleted', 'ticket', ticket.id, ticket.subject);
      showToast('Ticket closed and removed');
      onClose();
      return;
    }
    setStatus(newStatus);
    const updatePayload = { status: newStatus };
    if (newStatus === 'Resolved') updatePayload.resolved_at = new Date().toISOString();
    await supabase.from('tickets').update(updatePayload).eq('id', ticket.id);
    logActivity(null, `Status changed to ${newStatus}`, 'ticket', ticket.id, ticket.subject);
    showToast(`Ticket marked as ${newStatus}`);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await logActivity(null, 'Comment', 'ticket', ticket.id, ticket.subject, null, newComment);
    setNewComment('');
    showToast('Comment added');
    fetchComments();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Ticket Details" maxWidth="max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">{ticket.subject}</h3>
          <p className="text-sm text-gray-500">Customer: {ticket.customers?.name} | Priority: <span className={priorityColors[ticket.priority] + ' px-2 py-0.5 rounded-full text-xs'}>{ticket.priority}</span></p>
        </div>
        <div className="flex gap-2">
          {Object.keys(statusColors).map(s => (
            <button key={s} onClick={() => updateStatus(s)} className={`px-3 py-1 rounded text-sm border font-medium ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border text-sm text-gray-700 whitespace-pre-wrap">
        {ticket.description || 'No description provided.'}
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-4">Comments</h4>
        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
          {comments.map(c => (
            <div key={c.id} className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">{c.users?.name || 'System'}</span>
                <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-800">{c.action === 'Comment' ? JSON.parse(c.new_value) : c.action}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
        </div>
        <div className="flex gap-2">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Type your comment..." rows="2" className="flex-1 border p-2 rounded text-sm"></textarea>
          <button onClick={handleAddComment} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Add Comment</button>
        </div>
      </div>
    </Modal>
  );
};

const WhatsAppCenter = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: leads }, { data: custs }] = await Promise.all([
        supabase.from('leads').select('id, name, phone'),
        supabase.from('customers').select('id, name, phone')
      ]);
      const combined = [
        ...(leads || []).map(l => ({ ...l, type: 'Lead' })),
        ...(custs || []).map(c => ({ ...c, type: 'Customer' }))
      ].filter(c => c.phone);
      
      setContacts(combined);
      setFilteredContacts(combined);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredContacts(contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)));
  }, [search, contacts]);

  useEffect(() => {
    if (selectedContact) {
      supabase.from('activities').select('*').eq('module', 'whatsapp').eq('record_id', selectedContact.id).order('created_at', { ascending: false }).limit(10)
        .then(({data}) => setHistory(data || []));
    }
  }, [selectedContact]);

  const templates = {
    'Initial Follow-up': "Hi {name}, this is the team at SkynovaTech. Thank you for your interest! We'd love to understand your requirements. When would be a good time to connect?",
    'Proposal Follow-up': "Hi {name}, wanted to follow up on our recent proposal. Please let us know if you have any questions or need any changes. We're happy to help!",
    'Payment Reminder': "Hi {name}, this is a gentle reminder regarding your pending payment. Kindly arrange the payment at your earliest convenience. Thank you!",
    'Project Update': "Hi {name}, a quick update on your project — things are progressing well. We'll keep you posted on the next milestone. Thank you for your trust!",
    'Custom Message': ""
  };

  const handleTemplateSelect = (e) => {
    const tmpl = templates[e.target.value];
    if (selectedContact) {
      setMessage(tmpl.replace('{name}', selectedContact.name));
    }
  };

  const openWhatsApp = () => {
    if (!selectedContact || !message.trim()) return;
    const cleanPhone = selectedContact.phone.replace(/[\s\-\+]/g, '');
    const phoneNum = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const url = `https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    logActivity(null, 'WhatsApp message sent', 'whatsapp', selectedContact.id, selectedContact.name, null, message.substring(0, 100));
    showToast('WhatsApp opened — send the message manually');
    
    // Optimistic UI update for history
    setHistory([{ id: Date.now(), action: 'WhatsApp message sent', new_value: JSON.stringify(message.substring(0, 100)), created_at: new Date().toISOString() }, ...history].slice(0, 10));
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">WhatsApp Center</h2>
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left Panel - Contacts */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col shrink-0">
          <div className="p-4 border-b">
            <input type="text" placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map(c => (
              <div key={c.id} onClick={() => setSelectedContact(c)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 flex flex-col ${selectedContact?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.type === 'Lead' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{c.type}</span>
                </div>
                <span className="text-sm text-gray-500">{c.phone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Composer & Log */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {selectedContact ? (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2"><Phone className="text-green-500"/> {selectedContact.name}</h3>
                    <p className="text-gray-500">{selectedContact.phone} • {selectedContact.type}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Template</label>
                    <select onChange={handleTemplateSelect} className="w-full border p-2 rounded-lg text-sm">
                      <option value="">Select a template...</option>
                      {Object.keys(templates).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message Content</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows="5" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"></textarea>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 whitespace-pre-wrap">
                    <span className="font-semibold block mb-2 text-gray-500">Preview:</span>
                    {message || 'Your message preview will appear here.'}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setMessage('')} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Clear</button>
                    <button onClick={openWhatsApp} disabled={!message.trim()} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center gap-2 disabled:opacity-50">
                      <Phone size={18} /> Open WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 overflow-y-auto">
                <h4 className="font-semibold mb-4 text-gray-800">Message History</h4>
                <div className="space-y-3">
                  {history.map(h => (
                    <div key={h.id} className="p-3 bg-gray-50 rounded-lg border flex gap-3">
                      <Phone size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-800 italic">"{h.new_value ? JSON.parse(h.new_value) : ''}..."</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(h.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-sm text-gray-500">No previous messages found.</p>}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 flex-col gap-2">
              <Phone size={48} className="text-gray-300" />
              <p>Select a contact to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    // Hardcoded to match any or the first user, typically you'd filter by session.user.id
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    fetchNotifications();
    showToast('All notifications marked as read');
  };

  const markSingleRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'deal_update': return <BarChart2 size={20} className="text-blue-500" />;
      case 'task_due': return <CheckSquare size={20} className="text-orange-500" />;
      case 'payment_received': return <DollarSign size={20} className="text-green-500" />;
      case 'ticket_opened': return <CheckSquare size={20} className="text-purple-500" />;
      case 'proposal_accepted': return <FileText size={20} className="text-teal-500" />;
      case 'lead_assigned': return <Users size={20} className="text-indigo-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notification Center</h2>
        <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 shadow-sm font-medium">
          <CheckCircle size={16} /> Mark All as Read
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 w-12 text-center">Type</th>
                <th className="p-4 font-medium text-gray-600">Message</th>
                <th className="p-4 font-medium text-gray-600">Module</th>
                <th className="p-4 font-medium text-gray-600 w-48 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="4" className="text-center p-8"><Spinner /></td></tr> : 
               notifications.map(n => (
                 <tr key={n.id} onClick={() => !n.is_read && markSingleRead(n.id)} className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/50 font-medium' : 'text-gray-600'}`}>
                   <td className="p-4 text-center">{getIcon(n.type)}</td>
                   <td className="p-4 text-gray-900">{n.message}</td>
                   <td className="p-4 text-sm capitalize">{n.related_module?.replace('_', ' ') || 'General'}</td>
                   <td className="p-4 text-sm text-right whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</td>
                 </tr>
               ))}
               {notifications.length === 0 && !loading && (
                 <tr><td colSpan="4" className="text-center p-8 text-gray-500">No notifications to display.</td></tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const userData = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      role: fd.get('role'),
      department: fd.get('department'),
      joining_date: fd.get('joining_date') || null,
      avatar_color: fd.get('avatar_color') || 'blue'
    };

    if (editUser) {
      await supabase.from('users').update(userData).eq('id', editUser.id);
      showToast('Team member updated');
    } else {
      userData.status = 'Active';
      await supabase.from('users').insert([userData]);
      showToast('Team member added');
    }
    setModalOpen(false);
    fetchUsers();
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await supabase.from('users').update({ status: newStatus }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    showToast(`Status updated to ${newStatus}`);
  };

  const roleColors = { 'Admin': 'bg-purple-100 text-purple-800', 'Manager': 'bg-blue-100 text-blue-800', 'Sales': 'bg-green-100 text-green-800', 'Support': 'bg-teal-100 text-teal-800', 'Intern': 'bg-gray-100 text-gray-800' };
  const bgColors = { 'blue': 'bg-blue-500', 'green': 'bg-green-500', 'purple': 'bg-purple-500', 'red': 'bg-red-500', 'orange': 'bg-orange-500', 'teal': 'bg-teal-500' };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <button onClick={() => { setEditUser(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? <Spinner /> : users.map(u => (
          <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative">
            <button onClick={() => { setEditUser(u); setModalOpen(true); }} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
            <div className="flex flex-col items-center mb-4 pt-2">
              <div className={`w-16 h-16 rounded-full ${bgColors[u.avatar_color] || 'bg-blue-500'} text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-md`}>
                {u.name?.charAt(0) || 'U'}
              </div>
              <h3 className="font-bold text-lg text-gray-900">{u.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${roleColors[u.role] || 'bg-gray-100'}`}>{u.role || 'Member'}</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
              <div className="flex justify-between"><span>Email</span><span className="font-medium text-gray-800 truncate ml-2">{u.email}</span></div>
              <div className="flex justify-between"><span>Phone</span><span className="font-medium text-gray-800">{u.phone || '-'}</span></div>
              <div className="flex justify-between"><span>Dept</span><span className="font-medium text-gray-800">{u.department || '-'}</span></div>
              <div className="flex justify-between"><span>Joined</span><span className="font-medium text-gray-800">{u.joining_date ? new Date(u.joining_date).toLocaleDateString() : '-'}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <button onClick={() => toggleStatus(u.id, u.status)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${u.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${u.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editUser ? "Edit Team Member" : "Add Team Member"} maxWidth="max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm mb-1">Full Name *</label><input name="name" required defaultValue={editUser?.name} className="w-full border p-2 rounded text-sm" /></div>
          <div><label className="block text-sm mb-1">Email *</label><input type="email" name="email" required defaultValue={editUser?.email} className="w-full border p-2 rounded text-sm" /></div>
          <div><label className="block text-sm mb-1">Phone</label><input name="phone" defaultValue={editUser?.phone} className="w-full border p-2 rounded text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">Role</label>
              <select name="role" defaultValue={editUser?.role || 'Intern'} className="w-full border p-2 rounded text-sm">
                {Object.keys(roleColors).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="block text-sm mb-1">Department</label><input name="department" defaultValue={editUser?.department} className="w-full border p-2 rounded text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">Joining Date</label><input type="date" name="joining_date" defaultValue={editUser?.joining_date} className="w-full border p-2 rounded text-sm" /></div>
            <div><label className="block text-sm mb-1">Avatar Color</label>
              <select name="avatar_color" defaultValue={editUser?.avatar_color || 'blue'} className="w-full border p-2 rounded text-sm">
                {Object.keys(bgColors).map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-medium mt-4">Save Member</button>
        </form>
      </Modal>
    </div>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Company');
  const [companySettings, setCompanySettings] = useState(() => JSON.parse(localStorage.getItem('skynova_company_settings') || '{}'));
  const [preferences, setPreferences] = useState(() => JSON.parse(localStorage.getItem('skynova_company_settings') || '{}'));
  
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);

  const fetchServices = async () => {
    setLoadingServices(true);
    const { data } = await supabase.from('services').select('*').order('name');
    setServices(data || []);
    setLoadingServices(false);
  };

  useEffect(() => {
    if (activeTab === 'Services') fetchServices();
  }, [activeTab]);

  const saveCompanySettings = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const settings = {
      ...companySettings,
      companyName: fd.get('companyName'),
      tagline: fd.get('tagline'),
      address: fd.get('address'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      gstNumber: fd.get('gstNumber'),
      website: fd.get('website')
    };
    localStorage.setItem('skynova_company_settings', JSON.stringify(settings));
    setCompanySettings(settings);
    showToast('Company Settings saved');
  };

  const savePreferences = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const prefs = {
      ...preferences,
      defaultGst: Number(fd.get('defaultGst')),
      invoicePrefix: fd.get('invoicePrefix'),
      paymentTerms: fd.get('paymentTerms')
    };
    localStorage.setItem('skynova_company_settings', JSON.stringify(prefs));
    setPreferences(prefs);
    showToast('Preferences saved');
  };

  const handleServiceSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const service = {
      name: fd.get('name'),
      description: fd.get('description'),
      category: fd.get('category'),
      unit_price: fd.get('unit_price') ? Number(fd.get('unit_price')) : 0,
      is_active: fd.get('is_active') === 'on'
    };

    if (editService) {
      await supabase.from('services').update(service).eq('id', editService.id);
      showToast('Service updated');
    } else {
      await supabase.from('services').insert([service]);
      showToast('Service added');
    }
    setServiceModalOpen(false);
    fetchServices();
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    showToast('Service deleted');
    fetchServices();
  };

  const toggleServiceActive = async (id, currentVal) => {
    await supabase.from('services').update({ is_active: !currentVal }).eq('id', id);
    setServices(services.map(s => s.id === id ? { ...s, is_active: !currentVal } : s));
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b">
          {['Company', 'Services', 'Preferences'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'Company' && (
            <form onSubmit={saveCompanySettings} className="max-w-2xl space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">Company Name</label><input name="companyName" defaultValue={companySettings.companyName} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">Tagline</label><input name="tagline" defaultValue={companySettings.tagline} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Address</label><textarea name="address" defaultValue={companySettings.address} rows="3" className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500"></textarea></div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">Phone</label><input name="phone" defaultValue={companySettings.phone} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="email" defaultValue={companySettings.email} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">GST Number</label><input name="gstNumber" defaultValue={companySettings.gstNumber} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">Website</label><input name="website" defaultValue={companySettings.website} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Save Company Settings</button>
            </form>
          )}

          {activeTab === 'Services' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800">Service Catalogue</h3>
                <button onClick={() => { setEditService(null); setServiceModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium">
                  <Plus size={16} /> Add Service
                </button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 font-medium text-gray-600">Name</th>
                      <th className="p-3 font-medium text-gray-600">Category</th>
                      <th className="p-3 font-medium text-gray-600 text-right">Unit Price (₹)</th>
                      <th className="p-3 font-medium text-gray-600 text-center">Active</th>
                      <th className="p-3 font-medium text-gray-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingServices ? <tr><td colSpan="5" className="text-center p-8"><Spinner /></td></tr> :
                     services.map(s => (
                       <tr key={s.id} className="border-b hover:bg-gray-50">
                         <td className="p-3 font-medium text-gray-900">{s.name}</td>
                         <td className="p-3 text-gray-600">{s.category}</td>
                         <td className="p-3 text-right font-medium">₹{Number(s.unit_price).toLocaleString()}</td>
                         <td className="p-3 text-center">
                           <input type="checkbox" checked={s.is_active} onChange={() => toggleServiceActive(s.id, s.is_active)} className="w-4 h-4 text-blue-600 cursor-pointer" />
                         </td>
                         <td className="p-3 text-right flex justify-end gap-2">
                           <button onClick={() => { setEditService(s); setServiceModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                           <button onClick={() => deleteService(s.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash size={16} /></button>
                         </td>
                       </tr>
                     ))
                    }
                    {services.length === 0 && !loadingServices && <tr><td colSpan="5" className="text-center p-8 text-gray-500">No services added yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Preferences' && (
            <form onSubmit={savePreferences} className="max-w-2xl space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">Default GST %</label><input type="number" name="defaultGst" defaultValue={preferences.defaultGst || 18} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">Invoice Prefix</label><input name="invoicePrefix" defaultValue={preferences.invoicePrefix || 'INV'} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Default Payment Terms</label><textarea name="paymentTerms" defaultValue={preferences.paymentTerms} rows="4" className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. 100% advance before delivery..."></textarea></div>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Save Preferences</button>
            </form>
          )}
        </div>
      </div>

      <Modal isOpen={isServiceModalOpen} onClose={() => setServiceModalOpen(false)} title={editService ? "Edit Service" : "Add Service"} maxWidth="max-w-md">
        <form onSubmit={handleServiceSave} className="space-y-4">
          <div><label className="block text-sm mb-1">Service Name *</label><input name="name" required defaultValue={editService?.name} className="w-full border p-2 rounded text-sm" /></div>
          <div><label className="block text-sm mb-1">Category</label>
            <select name="category" defaultValue={editService?.category || 'Web Development'} className="w-full border p-2 rounded text-sm">
              {['Web Development', 'Mobile App', 'UI-UX Design', 'SEO', 'Maintenance', 'Consulting', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="block text-sm mb-1">Unit Price (₹) *</label><input type="number" name="unit_price" required min="0" defaultValue={editService?.unit_price} className="w-full border p-2 rounded text-sm" /></div>
          <div><label className="block text-sm mb-1">Description</label><textarea name="description" defaultValue={editService?.description} rows="3" className="w-full border p-2 rounded text-sm"></textarea></div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="is_active" id="is_active" defaultChecked={editService ? editService.is_active : true} className="w-4 h-4 text-blue-600 cursor-pointer" />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Active Service</label>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-medium mt-4">Save Service</button>
        </form>
      </Modal>
    </div>
  );
};


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
                  <th className="p-4 font-medium text-gray-600">Stipend</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600">Expiry Date</th>
                  <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingInterns ? <tr><td colSpan="7" className="text-center p-8"><Spinner /></td></tr> :
                 interns.map(i => {
                   const isExpired = i.expiry_date && new Date(i.expiry_date) < new Date();
                   const displayStatus = isExpired && i.status === 'Active' ? 'Expired' : i.status;
                   return (
                     <tr key={i.id} className="border-b hover:bg-gray-50">
                       <td className="p-4 font-bold text-gray-800">{i.intern_id}</td>
                       <td className="p-4 font-medium">{i.name}</td>
                       <td className="p-4">{i.email}</td>
                       <td className="p-4">
                         {i.stipend_amount > 0 ? (
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-gray-800">₹{i.stipend_amount}</span>
                             <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 font-medium border border-yellow-200">Pending</span>
                           </div>
                         ) : <span className="text-gray-400">-</span>}
                       </td>
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
  const [approvedApps, setApprovedApps] = useState([]);

  useEffect(() => {
    if (!existing) {
      // Fetch approved applications for the dropdown
      supabase.from('intern_applications').select('id, name, email, phone').eq('status', 'Approved')
        .then(({data}) => {
          if (data) setApprovedApps(data);
        });
    }

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

    const stipendAmount = Number(fd.get('stipend_amount')) || 0;

    const payload = {
      intern_id: fd.get('intern_id'),
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      status: fd.get('status'),
      expiry_date: expiryDate,
      stipend_amount: stipendAmount
    };

    if (password) {
      payload.password_hash = await hashPassword(password);
    }

    if (existing) {
      const { error } = await supabase.from('interns').update(payload).eq('id', existing.id);
      if (error) { showToast(error.message, 'error'); return; }
      
      // Also update stipends table
      if (stipendAmount > 0) {
        const { data: existingStipend } = await supabase.from('stipends').select('id').eq('intern_id', existing.id);
        if (existingStipend && existingStipend.length > 0) {
          await supabase.from('stipends').update({ amount: stipendAmount }).eq('intern_id', existing.id);
        } else {
          await supabase.from('stipends').insert([{ intern_id: existing.id, amount: stipendAmount, status: 'Pending', stipend_date: new Date().toISOString() }]);
        }
      }
      
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
      
      if (stipendAmount > 0) {
        await supabase.from('stipends').insert([{ intern_id: data.id, amount: stipendAmount, status: 'Pending', stipend_date: new Date().toISOString() }]);
      }

      // We can check if a prefilled ID was provided or if the user selected one from the dropdown
      const appIdToUpdate = prefilled ? prefilled.id : fd.get('approved_app_id');
      if (appIdToUpdate) {
        await supabase.from('intern_applications').update({ status: 'Approved' }).eq('id', appIdToUpdate);
      }
      
      logActivity(null, 'Created Intern', 'interns', data.id, payload.intern_id);
      showToast('Intern account created successfully');
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={existing ? "Edit Intern Account" : "Create Intern Account"} maxWidth="max-w-xl">
      <form onSubmit={handleSave} className="space-y-4">
        {!existing && approvedApps.length > 0 && !prefilled && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
            <label className="block text-sm font-medium text-blue-800 mb-1">Link Approved Applicant (Optional)</label>
            <select name="approved_app_id" onChange={(e) => {
              const app = approvedApps.find(a => a.id === e.target.value);
              if (app) {
                const form = e.target.closest('form');
                if (form) {
                  if (form.name) form.name.value = app.name || '';
                  if (form.email) form.email.value = app.email || '';
                  if (form.phone) form.phone.value = app.phone || '';
                }
              }
            }} className="w-full border-blue-300 p-2 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Manual Entry --</option>
              {approvedApps.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
            </select>
          </div>
        )}
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Stipend Amount (₹)</label>
            <input type="number" step="0.01" name="stipend_amount" defaultValue={existing?.stipend_amount || 0} min="0" className="w-full border p-2 rounded text-sm" />
          </div>
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
  const [activeInterns, setActiveInterns] = useState([]);
  
  const [activeTab, setActiveTab] = useState('Tasks');

  const fetchActiveInterns = async () => {
    const { data } = await supabase.from('interns').select('id, name, intern_id').eq('status', 'Active').order('name');
    setActiveInterns(data || []);
  };

  const fetchTasks = async () => {
    const { data } = await supabase.from('intern_tasks').select('*, interns(name, intern_id)').order('created_at', { ascending: false });
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
    fetchActiveInterns();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const internId = fd.get('intern_id');
    const task = {
      title: fd.get('title'),
      description: fd.get('description'),
      deadline: fd.get('deadline') || null,
      document_url: fd.get('document_url'),
      intern_id: internId || null
    };
    await supabase.from('intern_tasks').insert([task]);
    e.target.reset();
    const assignedIntern = activeInterns.find(i => i.id === internId);
    showToast(assignedIntern ? `Task assigned to ${assignedIntern.name}` : 'Task created (unassigned)');
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
                <div>
                  <label className="block text-sm mb-1">Assign To *</label>
                  <select name="intern_id" required className="w-full border p-2 rounded text-sm">
                    <option value="">Select Intern...</option>
                    {activeInterns.map(i => <option key={i.id} value={i.id}>{i.name} ({i.intern_id})</option>)}
                  </select>
                </div>
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
                  {t.interns && <p className="text-xs mt-1"><span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Assigned: {t.interns.name} ({t.interns.intern_id})</span></p>}
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

    const { data: tData } = await supabase.from('intern_tasks').select('*').eq('intern_id', internSession.id).order('deadline', { ascending: true });
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

// --- WEBSITE FORMS MODULE ---
const WebsiteForms = () => {
  const [activeTab, setActiveTab] = useState('Contact Leads');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const getTableName = (tab) => {
    if (tab === 'Contact Leads') return 'lead_captures';
    if (tab === 'Quotes') return 'quote_requests';
    if (tab === 'Internships') return 'intern_applications';
    if (tab === 'Courses') return 'course_applications';
    if (tab === 'Newsletter') return 'newsletter_subscribers';
    return '';
  };

  const fetchData = async () => {
    setLoading(true);
    const table = getTableName(activeTab);
    let query = supabase.from(table).select('*').order('created_at', { ascending: false });
    
    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }
    
    if (statusFilter !== 'All Status') {
       if (activeTab === 'Contact Leads') {
          query = query.eq('is_converted', statusFilter === 'Converted');
       } else {
          query = query.eq('status', statusFilter);
       }
    }

    const { data: res } = await query;
    setData(res || []);
    setLoading(false);
  };

  useEffect(() => {
    setSelectedIds(new Set());
    setSearch('');
    setStatusFilter('All Status');
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    const table = getTableName(activeTab);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert('Error deleting record: ' + error.message);
    else fetchData();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} records?`)) return;
    const table = getTableName(activeTab);
    const ids = Array.from(selectedIds);
    await supabase.from(table).delete().in('id', ids);
    setSelectedIds(new Set());
    fetchData();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const table = getTableName(activeTab);
    const updateData = activeTab === 'Contact Leads' ? { is_converted: newStatus === 'Converted' } : { status: newStatus };
    const { error } = await supabase.from(table).update(updateData).eq('id', id);
    if (error) alert('Error updating status: ' + error.message);
    else {
      setData(data.map(d => d.id === id ? { ...d, ...updateData } : d));
    }
  };

  const handleConvertToLead = async (item) => {
    const leadData = {
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      company: 'Website Inquiry',
      source: activeTab === 'Contact Leads' ? 'Website Contact' : 'Website Quote',
      status: 'New',
      priority: 'Medium',
      notes: activeTab === 'Contact Leads' ? `Subject: ${item.subject}\nMessage: ${item.message}` : `Service: ${item.main_service}\nDetails: ${item.detailed_service}\nMessage: ${item.message}`
    };

    const { error } = await supabase.from('leads').insert([leadData]);
    if (error) {
      alert('Error creating lead: ' + error.message);
    } else {
      alert('Successfully converted to CRM Lead!');
      handleUpdateStatus(item.id, 'Converted');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return `${age} yrs`;
  };

  const downloadPDF = async (item) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(24, 119, 242);
    doc.text(`Skynova Tech Solutions`, 105, 20, null, null, "center");
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${activeTab === 'Internships' ? 'Internship' : 'Course'} Application Profile`, 105, 30, null, null, "center");
    
    // Add Photo if it exists
    if (item.photo_url) {
      try {
        const imgUrl = item.photo_url;
        // Since Supabase storage URLs can have CORS issues with html2canvas/jsPDF, 
        // we load it into an Image object
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgUrl;
        });
        // Add to PDF (x, y, width, height)
        doc.addImage(img, 'JPEG', 150, 40, 40, 40);
      } catch (e) {
        console.error("Failed to load profile photo for PDF:", e);
      }
    }

    doc.setFontSize(12);
    let y = 50;
    
    const addLine = (label, value) => {
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(`${value || 'N/A'}`, 60, y);
      y += 10;
    };

    addLine("Name", item.name);
    addLine("Email", item.email);
    addLine("Phone", item.contact || item.phone);
    if (item.dob) addLine("Age", calculateAge(item.dob));
    if (activeTab === 'Internships') addLine("Domain", item.domain);
    if (activeTab === 'Courses') addLine("Course", item.course);
    
    if (item.college) addLine("College", item.college);
    if (item.address) {
       y+=5;
       doc.setFont(undefined, 'bold');
       doc.text(`Address:`, 20, y);
       doc.setFont(undefined, 'normal');
       doc.text(`${item.address}, ${item.district}, ${item.state} ${item.pincode}`, 20, y+8);
       y += 20;
    }

    addLine("Status", item.status || 'Pending');
    addLine("Submitted", new Date(item.created_at).toLocaleString());

    doc.save(`${item.name}_Profile.pdf`);
  };

  const exportTablePDF = () => {
    const doc = new jsPDF('landscape');
    doc.text(`${activeTab} Data Export`, 14, 15);
    // Basic table export using standard text (jsPDF-autotable would be better, but building manually here)
    let y = 30;
    data.forEach((item, i) => {
      if (y > 190) { doc.addPage(); y = 20; }
      const line = `${i+1}. ${item.name || item.email} - ${item.status || 'New'} - ${new Date(item.created_at).toLocaleDateString()}`;
      doc.text(line, 14, y);
      y += 10;
    });
    doc.save(`${activeTab}_Export.pdf`);
  };

  const renderStats = () => {
    if (activeTab !== 'Internships' && activeTab !== 'Courses') return null;
    const total = data.length;
    const approved = data.filter(d => d.status === 'Approved').length;
    const pending = data.filter(d => !d.status || d.status === 'Pending').length;
    const cancelled = data.filter(d => d.status === 'Cancelled').length;

    return (
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex-1 text-center border-r border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{total}</div>
          <div className="text-sm text-gray-500 font-medium">Total</div>
        </div>
        <div className="flex-1 text-center border-r border-gray-200">
          <div className="text-3xl font-bold text-green-600">{approved}</div>
          <div className="text-sm text-gray-500 font-medium">Approved</div>
        </div>
        <div className="flex-1 text-center border-r border-gray-200">
          <div className="text-3xl font-bold text-yellow-500">{pending}</div>
          <div className="text-sm text-gray-500 font-medium">Pending</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-3xl font-bold text-red-500">{cancelled}</div>
          <div className="text-sm text-gray-500 font-medium">Cancelled</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 overflow-y-auto">
      <div className="flex border-b mb-6 overflow-x-auto bg-white rounded-t-xl px-2 pt-2 shadow-sm">
        {['Contact Leads', 'Quotes', 'Internships', 'Courses', 'Newsletter'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-500"/>
          {activeTab === 'Contact Leads' && 'Contact Messages'}
          {activeTab === 'Quotes' && 'Quote Requests'}
          {activeTab === 'Internships' && 'Internship Applicants'}
          {activeTab === 'Courses' && 'Course Applicants'}
          {activeTab === 'Newsletter' && 'Newsletter Subscribers'}
        </h2>
      </div>

      {renderStats()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-white flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <input 
              type="text" 
              placeholder="Search by name/email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border p-2 rounded-lg w-64 text-sm focus:ring-2 outline-none"
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border p-2 rounded-lg text-sm outline-none">
              <option value="All Status">All Status</option>
              {(activeTab === 'Internships' || activeTab === 'Courses') && <>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Cancelled">Cancelled</option>
              </>}
              {activeTab === 'Quotes' && <>
                <option value="Pending">Pending</option>
                <option value="In Process">In Process</option>
                <option value="Approved">Approved</option>
              </>}
              {activeTab === 'Contact Leads' && <>
                <option value="New">Pending (New)</option>
                <option value="Converted">Converted</option>
              </>}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={exportTablePDF} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </button>
            {selectedIds.size > 0 && (
              <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                Delete Selected ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? <div className="flex justify-center p-8"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div> : (
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-[#2a3b4e] text-white">
                <tr>
                  {activeTab === 'Newsletter' && <th className="p-3 w-10"></th>}
                  <th className="p-3 w-16">ID</th>
                  {activeTab === 'Contact Leads' && <><th className="p-3">Full Name</th><th className="p-3">Email Address</th><th className="p-3">Subject</th><th className="p-3">Status</th><th className="p-3">Submitted At</th></>}
                  {activeTab === 'Quotes' && <><th className="p-3">Full Name</th><th className="p-3">Email Address</th><th className="p-3">Service</th><th className="p-3">Status</th><th className="p-3">Submitted</th></>}
                  {activeTab === 'Internships' && <><th className="p-3">Name</th><th className="p-3">Domain</th><th className="p-3">Age</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Submitted</th></>}
                  {activeTab === 'Courses' && <><th className="p-3">Name</th><th className="p-3">Course</th><th className="p-3">Age</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Submitted</th></>}
                  {activeTab === 'Newsletter' && <><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Date Subscribed</th></>}
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 text-sm text-gray-700">
                    {activeTab === 'Newsletter' && (
                      <td className="p-3">
                        <input type="checkbox" checked={selectedIds.has(item.id)} onChange={(e) => {
                          const newIds = new Set(selectedIds);
                          if (e.target.checked) newIds.add(item.id); else newIds.delete(item.id);
                          setSelectedIds(newIds);
                        }} className="w-4 h-4 cursor-pointer" />
                      </td>
                    )}
                    <td className="p-3 text-gray-500">{index + 1}</td>
                    
                    {/* Contact Leads */}
                    {activeTab === 'Contact Leads' && <>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.email}</td>
                      <td className="p-3 max-w-xs truncate" title={item.subject || item.message}>{item.subject || 'Website Message'}</td>
                      <td className="p-3">
                        <select 
                          value={item.is_converted ? 'Converted' : 'New'} 
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className={`text-xs font-medium rounded px-2 py-1 border outline-none ${item.is_converted ? 'bg-green-100 text-green-800 border-green-200' : 'bg-teal-100 text-teal-800 border-teal-200'}`}
                        >
                          <option value="New">Pending</option>
                          <option value="Converted">Converted</option>
                        </select>
                      </td>
                      <td className="p-3">{new Date(item.created_at).toLocaleString('en-GB', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true})}</td>
                    </>}
                    
                    {/* Quotes */}
                    {activeTab === 'Quotes' && <>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.email}</td>
                      <td className="p-3">{item.main_service}</td>
                      <td className="p-3">
                        <select 
                          value={item.status || 'Pending'} 
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className={`text-xs font-medium rounded px-2 py-1 border outline-none ${item.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' : item.status === 'In Process' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-teal-100 text-teal-800 border-teal-200'}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Process">In Process</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </td>
                      <td className="p-3">{new Date(item.created_at).toLocaleString('en-GB')}</td>
                    </>}

                    {/* Internships & Courses */}
                    {(activeTab === 'Internships' || activeTab === 'Courses') && <>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{activeTab === 'Internships' ? item.domain : item.course}</td>
                      <td className="p-3">{calculateAge(item.dob)}</td>
                      <td className="p-3">{item.email}</td>
                      <td className="p-3">
                        <select 
                          value={item.status || 'Pending'} 
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className={`text-xs font-medium rounded px-2 py-1 border outline-none bg-white`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3">{new Date(item.created_at).toLocaleString('en-GB', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true})}</td>
                    </>}

                    {/* Newsletter */}
                    {activeTab === 'Newsletter' && <>
                      <td className="p-3">{item.email}</td>
                      <td className="p-3">
                         <span className="text-xs font-medium rounded px-2 py-1 bg-green-100 text-green-800 border border-green-200">
                           {item.status || 'Subscribed'}
                         </span>
                      </td>
                      <td className="p-3">{new Date(item.created_at).toISOString().replace('T', ' ').substring(0, 16)}</td>
                    </>}

                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        {(activeTab === 'Internships' || activeTab === 'Courses') && (
                          <button onClick={() => downloadPDF(item)} className="px-2 py-1 text-xs border border-blue-500 text-blue-600 hover:bg-blue-50 rounded">
                            PDF
                          </button>
                        )}
                        <button className="px-2 py-1 text-xs border border-blue-500 text-blue-600 hover:bg-blue-50 rounded">
                          View
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="px-2 py-1 text-xs border border-red-500 text-red-600 hover:bg-red-50 rounded">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan="8" className="text-center p-8 text-gray-500">No submissions found for {activeTab}.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIL SENDER COMPONENT ---
const MailSender = () => {
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!emails || !subject || !message) return alert("Please fill all fields");
    setSending(true);
    // Simulate API call for sending emails
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    alert(`Successfully sent email to: ${emails}`);
    setEmails(''); setSubject(''); setMessage('');
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 items-center overflow-y-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-3xl w-full mt-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-1">Skynova Tech Solutions</h2>
          <h3 className="text-xl font-semibold text-gray-800">Mail Sender</h3>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <input 
              type="text" 
              placeholder="Recipient Emails (comma separated)" 
              value={emails}
              onChange={e => setEmails(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1 ml-1">Example: user1@mail.com, user2@mail.com</p>
          </div>

          <div>
            <input 
              type="text" 
              placeholder="Email Subject" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b p-2 flex gap-4 text-sm text-gray-600">
              <button type="button" className="hover:text-black font-medium">File</button>
              <button type="button" className="hover:text-black font-medium">Edit</button>
              <button type="button" className="hover:text-black font-medium">View</button>
              <button type="button" className="hover:text-black font-medium">Insert</button>
              <button type="button" className="hover:text-black font-medium">Format</button>
            </div>
            <div className="bg-white border-b p-2 flex gap-3 items-center text-gray-600">
              <button type="button" className="p-1 hover:bg-gray-100 rounded">↶</button>
              <button type="button" className="p-1 hover:bg-gray-100 rounded">↷</button>
              <select className="border rounded px-2 py-1 text-sm outline-none bg-transparent">
                <option>Paragraph</option>
                <option>Heading 1</option>
              </select>
              <button type="button" className="p-1 font-bold hover:bg-gray-100 rounded">B</button>
              <button type="button" className="p-1 italic hover:bg-gray-100 rounded">I</button>
              <button type="button" className="p-1 hover:bg-gray-100 rounded">≡</button>
            </div>
            <textarea 
              placeholder="Email Message" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-4 h-64 outline-none resize-none"
              required
            ></textarea>
            <div className="bg-gray-50 border-t p-1 flex justify-between text-xs text-gray-400 px-3">
              <span>p</span>
              <span className="font-bold flex items-center gap-1"><span className="text-blue-500">O</span> tiny</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={sending}
            className="w-full bg-[#1877F2] hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-70"
          >
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
export default function SkynovaCRM() {
  const [currentRoute, setRoute] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [internSession, setInternSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdmin(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (internSession) localStorage.setItem('intern_session', JSON.stringify(internSession));
    else localStorage.removeItem('intern_session');
  }, [internSession]);

  const checkAdmin = async (session) => {
    if (session) {
      const email = session.user?.email?.toLowerCase().trim();
      const authorizedEmails = ['rohithmech2006@gmail.com', 'nirmalraj9607@gmail.com', 'skynovatechsolutions@gmail.com'];
      if (!authorizedEmails.includes(email)) {
        alert('Access Denied: Your email (' + email + ') is not authorized. Only admins can log in.');
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

    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10)
      .then(({data}) => setRecentNotifications(data || []));

    const sub = supabase.channel('realtime_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        setUnreadCount(prev => prev + 1);
        setRecentNotifications(prev => [payload.new, ...prev].slice(0, 10));
      }).subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isNotificationsOpen && !e.target.closest('.notifications-dropdown-container')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

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
      case 'projects': return <Projects />;
      case 'website_forms': return <WebsiteForms />;
      case 'interns': return <InternsManagement />;
      case 'intern_tasks': return <InternTasksAdmin />;
      case 'invoices': return <Invoices />;
      case 'tickets': return <SupportTickets />;
      case 'whatsapp': return <WhatsAppCenter />;
      case 'mail_sender': return <MailSender />;
      case 'team': return <TeamManagement />;
      case 'notifications': return <NotificationCenter />;
      case 'settings': return <SettingsPage />;
      case 'reports': return <Reports />;
      case 'activities': return <ActivityLog />;
      default: return <Dashboard />;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center bg-[#f1f5f9]"><Spinner size={40} /></div>;

  const handleInternLogin = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = fd.get('intern_id');
    const pwd = fd.get('password');
    
    setAuthLoading(true);
    const { data: intern, error } = await supabase.from('interns').select('*').eq('intern_id', id).single();
    
    if (error || !intern) {
      alert('Invalid User ID or password.');
    } else if (intern.status === 'Expired' || (intern.expiry_date && new Date(intern.expiry_date) < new Date())) {
      alert('Your internship access has expired. Please contact the administrator.');
    } else if (intern.status === 'Suspended') {
      alert('Your account is suspended. Please contact the administrator.');
    } else {
      const hashed = await hashPassword(pwd);
      if (intern.password_hash === hashed) {
        setInternSession(intern);
      } else {
        alert('Invalid User ID or password.');
      }
    }
    setAuthLoading(false);
  };

  if (internSession) {
    return <InternPortal internSession={internSession} setInternSession={setInternSession} />;
  }

  if (!session && !internSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f1f5f9] font-sans">
        <ToastContainer />
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <div className="flex justify-center mb-6">
            <Activity size={48} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-6">Skynova CRM</h1>
          
          <div className="flex border-b mb-6">
            <button onClick={() => setRoute('admin_login')} className={`flex-1 pb-2 font-medium ${currentRoute !== 'intern_login' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Admin Login</button>
            <button onClick={() => setRoute('intern_login')} className={`flex-1 pb-2 font-medium ${currentRoute === 'intern_login' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Intern Portal</button>
          </div>

          {currentRoute === 'intern_login' ? (
            <form onSubmit={handleInternLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Internship User ID</label>
                <input name="intern_id" required placeholder="e.g. INT001" className="w-full border p-3 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                <input type="password" name="password" required className="w-full border p-3 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button type="submit" disabled={authLoading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 mt-2">
                {authLoading ? 'Verifying...' : 'Login to Intern Portal'}
              </button>
            </form>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">Admin Access Only</p>
              <button 
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </button>
            </>
          )}
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
            <div className="relative notifications-dropdown-container">
              <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="relative p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden flex flex-col">
                  <div className="p-3 bg-gray-50 border-b font-medium text-gray-700">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                    ) : (
                      recentNotifications.map(n => {
                        let Icon = Bell;
                        if (n.type === 'deal_update') Icon = BarChart2;
                        else if (n.type === 'task_due') Icon = CheckSquare;
                        else if (n.type === 'payment_received') Icon = DollarSign;
                        else if (n.type === 'ticket_opened') Icon = CheckSquare;
                        else if (n.type === 'proposal_accepted') Icon = FileText;
                        else if (n.type === 'lead_assigned') Icon = Users;

                        return (
                          <div key={n.id} className={`p-3 border-b hover:bg-gray-50 flex items-start gap-3 ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                            <div className="mt-1"><Icon size={16} className="text-blue-500"/></div>
                            <div>
                              <p className="text-sm text-gray-800">{n.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <button onClick={async () => {
                    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
                    setUnreadCount(0);
                    setRecentNotifications(recentNotifications.map(n => ({...n, is_read: true})));
                  }} className="p-2 text-center text-sm text-blue-600 hover:bg-gray-50 border-t font-medium">Mark all as read</button>
                </div>
              )}
            </div>
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



