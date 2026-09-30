import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarEvent,
  fetchCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  CreateEventInput,
} from '../../services/calendarService';
import {
  TaskItem,
  fetchTasks,
  createTask,
  toggleTaskStatus,
  deleteTask,
} from '../../services/tasksService';
import {
  FarmContact,
  fetchContacts,
  createContact,
  deleteContact,
  CreateContactInput,
} from '../../services/contactsService';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Circle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Sprout,
  ShieldCheck,
  CalendarDays,
  FileText,
  UserPlus,
  Building,
} from 'lucide-react';

type WorkspaceSubTab = 'calendar' | 'tasks' | 'contacts';

// Agricultural 1-click Quick Templates for Calendar
const QUICK_AGRI_EVENTS = [
  {
    title: '🌿 Jeevamrutha Microbial Preparation',
    desc: 'Mix 10kg cow dung, 10L urine, 2kg jaggery, 2kg besan, handful of forest soil in 200L water. Ferment for 48 hours.',
  },
  {
    title: '🌾 Organic Crop Harvest & Mandi Transit',
    desc: 'Harvest mature crop at early morning dew-free hours. Pack in breathable jute bags for farmer mandi sale.',
  },
  {
    title: '💧 Micro-Drip Irrigation Cycle & Fertigation',
    desc: 'Run drip irrigation for 2 hours. Inject filtered bio-digestate liquid through venturi.',
  },
  {
    title: '🐛 Neemastra / Dashaparni Bio-Spray',
    desc: 'Foliar spray 5% Neem extract emulsion on all crops for preventative sucking-pest control.',
  },
];

// Agricultural 1-click Quick Templates for Tasks
const QUICK_AGRI_TASKS = [
  'Prepare 200L Jeevamrutha drum for plot A fertigation',
  'Inspect tomato crop lower leaves for fungal leaf spots',
  'Flush drip irrigation laterals and clean screen filters',
  'Turn compost windrow pile to maintain 60°C microbial heat',
  'Contact local organic seed co-operative for kharif seeds',
  'Check soil moisture in fruit orchard before heat peak',
];

export const FarmWorkspaceHub: React.FC = () => {
  const { user, hasGoogleWorkspaceToken, connectGoogleWorkspace } = useAuth();

  const [activeTab, setActiveTab] = useState<WorkspaceSubTab>('calendar');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Calendar state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<CreateEventInput>({
    summary: '',
    description: '',
    location: user?.village ? `${user.village}, ${user.district || ''}` : '',
    startDate: new Date().toISOString().split('T')[0],
    isAllDay: false,
  });

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  // Contacts state
  const [contacts, setContacts] = useState<FarmContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [contactCategoryFilter, setContactCategoryFilter] = useState('All');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [newContact, setNewContact] = useState<CreateContactInput>({
    name: '',
    phone: '',
    email: '',
    category: 'Agronomist / Farm Advisor',
    organization: '',
  });

  // Destructive Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionLabel: 'Delete',
    onConfirm: () => {},
  });

  // Load calendar events
  const loadEvents = useCallback(async () => {
    if (!hasGoogleWorkspaceToken) return;
    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const data = await fetchCalendarEvents();
      setEvents(data);
    } catch (err: any) {
      if (err.message === 'NOT_AUTHENTICATED') {
        setEventsError('Google Workspace session expired. Please reconnect your Google account.');
      } else {
        setEventsError(err.message || 'Failed to load calendar events');
      }
    } finally {
      setIsLoadingEvents(false);
    }
  }, [hasGoogleWorkspaceToken]);

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!hasGoogleWorkspaceToken) return;
    setIsLoadingTasks(true);
    setTasksError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err: any) {
      if (err.message === 'NOT_AUTHENTICATED') {
        setTasksError('Google Workspace session expired. Please reconnect your Google account.');
      } else {
        setTasksError(err.message || 'Failed to load tasks');
      }
    } finally {
      setIsLoadingTasks(false);
    }
  }, [hasGoogleWorkspaceToken]);

  // Load contacts
  const loadContacts = useCallback(async () => {
    if (!hasGoogleWorkspaceToken) return;
    setIsLoadingContacts(true);
    setContactsError(null);
    try {
      const data = await fetchContacts();
      setContacts(data);
    } catch (err: any) {
      if (err.message === 'NOT_AUTHENTICATED') {
        setContactsError('Google Workspace session expired. Please reconnect your Google account.');
      } else {
        setContactsError(err.message || 'Failed to load contacts');
      }
    } finally {
      setIsLoadingContacts(false);
    }
  }, [hasGoogleWorkspaceToken]);

  // Initial load when tab or token changes
  useEffect(() => {
    if (hasGoogleWorkspaceToken) {
      if (activeTab === 'calendar') loadEvents();
      if (activeTab === 'tasks') loadTasks();
      if (activeTab === 'contacts') loadContacts();
    }
  }, [hasGoogleWorkspaceToken, activeTab, loadEvents, loadTasks, loadContacts]);

  // Connect Google account handler
  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      const res = await connectGoogleWorkspace();
      if (!res.success) {
        setConnectError(res.error || 'Connection cancelled or failed.');
      }
    } catch (err: any) {
      setConnectError(err.message || 'Failed to connect Google account');
    } finally {
      setIsConnecting(false);
    }
  };

  // Create event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.summary.trim()) return;

    try {
      await createCalendarEvent(newEvent);
      setIsEventModalOpen(false);
      setNewEvent({
        summary: '',
        description: '',
        location: '',
        startDate: new Date().toISOString().split('T')[0],
        isAllDay: false,
      });
      await loadEvents();
    } catch (err: any) {
      setEventsError(err.message || 'Failed to create event');
    }
  };

  // Delete event with user confirmation
  const requestDeleteEvent = (event: CalendarEvent) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Calendar Event?',
      message: `Are you sure you want to permanently delete "${event.summary}" from your Google Calendar? This action cannot be undone.`,
      actionLabel: 'Delete Event',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await deleteCalendarEvent(event.id);
          await loadEvents();
        } catch (err: any) {
          setEventsError(err.message || 'Failed to delete event');
        }
      },
    });
  };

  // Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await createTask('@default', {
        title: newTaskTitle,
        notes: newTaskNotes,
        due: newTaskDue ? new Date(newTaskDue).toISOString() : undefined,
      });
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      await loadTasks();
    } catch (err: any) {
      setTasksError(err.message || 'Failed to create task');
    }
  };

  // Toggle task completed
  const handleToggleTask = async (task: TaskItem) => {
    const isNowCompleted = task.status !== 'completed';
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: isNowCompleted ? 'completed' : 'needsAction' } : t))
    );
    try {
      await toggleTaskStatus('@default', task.id, isNowCompleted);
    } catch (err: any) {
      await loadTasks();
    }
  };

  // Delete task with user confirmation
  const requestDeleteTask = (task: TaskItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Google Task?',
      message: `Are you sure you want to permanently delete task "${task.title}" from your Google Tasks list?`,
      actionLabel: 'Delete Task',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await deleteTask('@default', task.id);
          await loadTasks();
        } catch (err: any) {
          setTasksError(err.message || 'Failed to delete task');
        }
      },
    });
  };

  // Create contact
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim()) return;

    try {
      await createContact(newContact);
      setIsContactModalOpen(false);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        category: 'Agronomist / Farm Advisor',
        organization: '',
      });
      await loadContacts();
    } catch (err: any) {
      setContactsError(err.message || 'Failed to add contact');
    }
  };

  // Delete contact with user confirmation
  const requestDeleteContact = (contact: FarmContact) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Google Contact?',
      message: `Are you sure you want to delete "${contact.name}" from your Google Contacts?`,
      actionLabel: 'Delete Contact',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await deleteContact(contact.resourceName);
          await loadContacts();
        } catch (err: any) {
          setContactsError(err.message || 'Failed to delete contact');
        }
      },
    });
  };

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    if (contactCategoryFilter !== 'All' && c.category !== contactCategoryFilter) return false;
    if (contactSearch.trim()) {
      const q = contactSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.organization && c.organization.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
            <CalendarDays className="h-3.5 w-3.5" />
            Google Workspace Farm Management
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Farm Schedule, Tasks & Contacts
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Synchronize crop spray schedules, sowing dates, and harvest days with Google Calendar. Track field operations with Google Tasks, and maintain your agricultural supplier network with Google Contacts.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'calendar'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Google Calendar</span>
            {events.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] text-emerald-300">
                {events.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'tasks'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Google Tasks</span>
            {tasks.filter((t) => t.status !== 'completed').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] text-emerald-300">
                {tasks.filter((t) => t.status !== 'completed').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'contacts'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Farm Contacts</span>
            {contacts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] text-emerald-300">
                {contacts.length}
              </span>
            )}
          </button>
        </div>

        {/* Sync status indicator */}
        <div className="flex items-center gap-2">
          {hasGoogleWorkspaceToken ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Workspace Connected</span>
              <button
                onClick={() => {
                  if (activeTab === 'calendar') loadEvents();
                  if (activeTab === 'tasks') loadTasks();
                  if (activeTab === 'contacts') loadContacts();
                }}
                className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-300"
                title="Refresh Google Workspace data"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isConnecting ? 'Connecting...' : 'Connect Google Workspace'}</span>
            </button>
          )}
        </div>
      </div>

      {connectError && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{connectError}</span>
        </div>
      )}

      {/* Workspace Authentication Gate Notice if not authenticated with Google */}
      {!hasGoogleWorkspaceToken && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Connect Google Workspace</h3>
            <p className="text-xs text-slate-400 mt-1">
              Grant permission to synchronize your farm operations with Google Calendar, manage field checklists with Google Tasks, and store contacts with Google Contacts.
            </p>
          </div>

          <button
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg transition-all active:scale-98"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isConnecting ? 'Signing in with Google...' : 'Sign in with Google'}</span>
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. GOOGLE CALENDAR VIEW */}
      {/* ============================================================== */}
      {hasGoogleWorkspaceToken && activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Quick presets and Add Event Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-emerald-400" />
                Upcoming Farm Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Events synced with your Google Calendar account.
              </p>
            </div>

            <button
              onClick={() => setIsEventModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Schedule Farm Event
            </button>
          </div>

          {/* Agricultural 1-Click Templates */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Quick Agricultural Event Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {QUICK_AGRI_EVENTS.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setNewEvent({
                      summary: tmpl.title,
                      description: tmpl.desc,
                      location: user?.village ? `${user.village}, ${user.district || ''}` : '',
                      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      isAllDay: false,
                    });
                    setIsEventModalOpen(true);
                  }}
                  className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-emerald-500/40 transition-all text-xs group"
                >
                  <div className="font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                    {tmpl.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {tmpl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {eventsError && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{eventsError}</span>
            </div>
          )}

          {/* Events List */}
          {isLoadingEvents ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-emerald-400">
              <span className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Fetching events from Google Calendar...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
              <CalendarDays className="h-10 w-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">No Upcoming Farm Events</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Schedule your next irrigation cycle, bio-spray schedule, or harvest delivery to Google Calendar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map((ev) => {
                const dateStr = ev.start.dateTime
                  ? new Date(ev.start.dateTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ev.start.date
                  ? `${new Date(ev.start.date).toLocaleDateString()} (All Day)`
                  : 'Upcoming';

                return (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dateStr}
                        </span>
                        <div className="flex items-center gap-1">
                          {ev.htmlLink && (
                            <a
                              href={ev.htmlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg text-slate-400 hover:text-emerald-300 transition-colors"
                              title="Open in Google Calendar"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => requestDeleteEvent(ev)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-white text-sm leading-snug">
                        {ev.summary}
                      </h4>

                      {ev.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}

                      {ev.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1 border-t border-slate-800/80">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. GOOGLE TASKS VIEW */}
      {/* ============================================================== */}
      {hasGoogleWorkspaceToken && activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-emerald-400" />
                Farm Operations Checklist
              </h3>
              <p className="text-xs text-slate-400">
                To-do items synced directly with your Google Tasks account.
              </p>
            </div>
          </div>

          {/* Quick Task Presets */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              1-Click Farming Task Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_AGRI_TASKS.map((tText, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    createTask('@default', { title: tText }).then(() => loadTasks());
                  }}
                  className="px-2.5 py-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-3 w-3 text-emerald-400" />
                  {tText}
                </button>
              ))}
            </div>
          </div>

          {/* Create Task Form */}
          <form
            onSubmit={handleCreateTask}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="What farm task needs to be done? (e.g. Sowing plot B, Spray Neemastra)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <input
                type="date"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          </form>

          {tasksError && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{tasksError}</span>
            </div>
          )}

          {/* Tasks List */}
          {isLoadingTasks ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-emerald-400">
              <span className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Fetching tasks from Google Tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
              <CheckSquare className="h-10 w-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">All Field Tasks Completed!</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add daily farm chores or click any of the 1-click presets above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-3.5 flex items-center justify-between gap-3 transition-all ${
                      isDone
                        ? 'border-slate-800/60 bg-slate-950/40 opacity-60'
                        : 'border-slate-800 bg-slate-900/80 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isDone ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.notes && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {task.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.due && (
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          Due {new Date(task.due).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        onClick={() => requestDeleteTask(task)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. GOOGLE CONTACTS / AGRONOMY DIRECTORY VIEW */}
      {/* ============================================================== */}
      {hasGoogleWorkspaceToken && activeTab === 'contacts' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                Farm Contacts & Agronomy Directory
              </h3>
              <p className="text-xs text-slate-400">
                Direct contacts for Mandi traders, seed suppliers, agronomists, and tractor services.
              </p>
            </div>

            <button
              onClick={() => setIsContactModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              Add Farm Contact
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search contact by name, phone, or organization..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
            <select
              value={contactCategoryFilter}
              onChange={(e) => setContactCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Agronomist / Farm Advisor">Agronomist / Farm Advisor</option>
              <option value="Mandi Trader / Buyer">Mandi Trader / Buyer</option>
              <option value="Seed & Nursery Dealer">Seed & Nursery Dealer</option>
              <option value="Tractor / Harvester Rental">Tractor / Harvester Rental</option>
              <option value="Veterinary Doctor">Veterinary Doctor</option>
              <option value="Organic Co-operative">Organic Co-operative</option>
            </select>
          </div>

          {contactsError && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{contactsError}</span>
            </div>
          )}

          {/* Contacts List */}
          {isLoadingContacts ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-emerald-400">
              <span className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Loading contacts from Google Contacts...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
              <Users className="h-10 w-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">No Farm Contacts Found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add local mandi traders, seed suppliers, or agronomists to your Google Contacts directory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredContacts.map((contact, idx) => (
                <div
                  key={contact.resourceName || idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold truncate">
                        {contact.category || 'Agricultural Contact'}
                      </span>
                      <button
                        onClick={() => requestDeleteContact(contact)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {contact.photoUrl ? (
                        <img
                          src={contact.photoUrl}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-sm truncate">{contact.name}</h4>
                        {contact.organization && (
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-500 shrink-0" />
                            {contact.organization}
                          </div>
                        )}
                      </div>
                    </div>

                    {contact.phone && (
                      <div className="text-xs text-slate-300 flex items-center gap-2 pt-1">
                        <Phone className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-mono">{contact.phone}</span>
                      </div>
                    )}

                    {contact.email && (
                      <div className="text-xs text-slate-400 flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE CALENDAR EVENT MODAL */}
      {/* ============================================================== */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-400" />
              Schedule Farm Event
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sowing Mustard Plot 2, Harvest Transit"
                  value={newEvent.summary}
                  onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Event Type
                  </label>
                  <label className="flex items-center gap-2 h-10 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.isAllDay}
                      onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>All-Day Event</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Location / Farm Plot
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot A, Baramati, Pune"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Agronomy Notes & Preparation Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Recommended inputs: 10kg vermicompost, 2L buttermilk spray..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE CONTACT MODAL */}
      {/* ============================================================== */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              Add Farm Contact
            </h3>

            <form onSubmit={handleCreateContact} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar, Dr. Swaminathan"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={newContact.category}
                  onChange={(e) => setNewContact({ ...newContact, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="Agronomist / Farm Advisor">Agronomist / Farm Advisor</option>
                  <option value="Mandi Trader / Buyer">Mandi Trader / Buyer</option>
                  <option value="Seed & Nursery Dealer">Seed & Nursery Dealer</option>
                  <option value="Tractor / Harvester Rental">Tractor / Harvester Rental</option>
                  <option value="Veterinary Doctor">Veterinary Doctor</option>
                  <option value="Organic Co-operative">Organic Co-operative</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Organization / Mandi
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. APMC Mandi, BioAgri"
                    value={newContact.organization}
                    onChange={(e) =>
                      setNewContact({ ...newContact, organization: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="advisor@farmcoop.org"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MANDATORY DESTRUCTIVE ACTION CONFIRMATION DIALOG */}
      {/* ============================================================== */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-red-500/30 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">{confirmDialog.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{confirmDialog.message}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-md shadow-red-500/20"
              >
                {confirmDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
