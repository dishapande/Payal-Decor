import { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  MessageSquare,
  Clock,
  Video,
  MapPin,
  User,
  Check,
  CheckCheck,
  Send,
  Plus,
  Search,
  Building2,
  ExternalLink,
  AlertCircle,
  FileText,
  DollarSign,
  Truck,
  X,
  Phone,
  Sparkles,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* ------------------------------------------------------------------ */
/* Client Meeting Types & Mock Data                                    */
/* ------------------------------------------------------------------ */

export interface ClientMeeting {
  id: string;
  title: string;
  clientName: string;
  clientCompany: string;
  clientRole: string;
  phone?: string;
  date: string;
  time: string;
  type: "Site Visit" | "Design Review" | "Commercial" | "Factory Inspection";
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  agenda: string;
  status: "Scheduled by Client" | "Confirmed" | "Completed" | "Rescheduled";
  urgency: "today" | "tomorrow" | "upcoming";
}

const INITIAL_MEETINGS: ClientMeeting[] = [
  {
    id: "m-1",
    title: "Site Measurement & Layout Approval",
    clientName: "Amit Sharma",
    clientCompany: "Skyline Corp",
    clientRole: "Managing Director",
    phone: "+91 98220 14890",
    date: "Today, May 12, 2025",
    time: "11:30 AM – 12:30 PM",
    type: "Site Visit",
    location: "Skyline Towers, 4th Floor, Senapati Bapat Rd, Pune",
    isVirtual: false,
    agenda: "On-site laser measurement for 120 modular workstations and partition heights.",
    status: "Scheduled by Client",
    urgency: "today",
  },
  {
    id: "m-2",
    title: "Laminate & Edge-Banding Finish Selection",
    clientName: "Sneha Patil",
    clientCompany: "Urban Spaces Architecture",
    clientRole: "Principal Architect",
    phone: "+91 97654 32109",
    date: "Tomorrow, May 13, 2025",
    time: "03:00 PM – 04:00 PM",
    type: "Design Review",
    location: "Payal Decor Experience Center & Showroom, Pune",
    isVirtual: false,
    agenda: "Physical material sample sign-off (Smoke Teak laminate, 2mm PVC edge band, matte black powder coating).",
    status: "Scheduled by Client",
    urgency: "tomorrow",
  },
  {
    id: "m-3",
    title: "Final Commercial & Quotation Signoff",
    clientName: "Rajesh Verma",
    clientCompany: "Design Hub Pvt. Ltd.",
    clientRole: "Procurement Head",
    phone: "+91 94230 77123",
    date: "May 18, 2025",
    time: "02:00 PM – 03:00 PM",
    type: "Commercial",
    location: "Google Meet",
    isVirtual: true,
    meetingLink: "https://meet.google.com/pd-skyline-quote",
    agenda: "Final discount review for QT-25-26-0045 (₹ 18.4L) and advance payment milestone sign-off.",
    status: "Confirmed",
    urgency: "upcoming",
  },
  {
    id: "m-4",
    title: "Pre-Dispatch Modular Batch Quality Inspection",
    clientName: "Karan Malhotra",
    clientCompany: "Nexus Infotech Solutions",
    clientRole: "Facilities Manager",
    phone: "+91 98811 55667",
    date: "May 22, 2025",
    time: "04:30 PM – 05:30 PM",
    type: "Factory Inspection",
    location: "Payal Decor Manufacturing Plant, MIDC Bhosari",
    isVirtual: false,
    agenda: "Client inspection of 45 completed benching desk units before loading onto dispatch trucks.",
    status: "Scheduled by Client",
    urgency: "upcoming",
  },
];

/* ------------------------------------------------------------------ */
/* Notifications Data                                                 */
/* ------------------------------------------------------------------ */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  category: "alert" | "sales" | "production" | "payment" | "meeting";
  read: boolean;
  actionText?: string;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    title: "New Client Meeting Scheduled",
    message: "Sneha Patil (Urban Spaces) scheduled a Design Review meeting for tomorrow at 3:00 PM.",
    time: "10m ago",
    category: "meeting",
    read: false,
    actionText: "View Meeting",
  },
  {
    id: "n-2",
    title: "Quotation Approved by Client",
    message: "Skyline Corp approved Quotation QT-25-26-0045 for ₹ 18,40,000.",
    time: "25m ago",
    category: "sales",
    read: false,
    actionText: "Generate Sales Order",
  },
  {
    id: "n-3",
    title: "Material Safety Stock Alert",
    message: "18mm Action TESA Pre-lam MDF is below reorder level (only 12 sheets left in Plant 1).",
    time: "1h ago",
    category: "alert",
    read: false,
    actionText: "Reorder Material",
  },
  {
    id: "n-4",
    title: "Client Payment Received",
    message: "₹ 2,45,000 credited via NEFT from Design Hub Pvt. Ltd. for INV-25-26-0031.",
    time: "3h ago",
    category: "payment",
    read: true,
  },
  {
    id: "n-5",
    title: "Work Order Completed",
    message: "WO-25-26-0012 Edge Banding completed. Moved to CNC Machining stage.",
    time: "5h ago",
    category: "production",
    read: true,
  },
];

/* ------------------------------------------------------------------ */
/* Client Messages Data & Active Chat Threads                          */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  sender: "client" | "user";
  text: string;
  time: string;
}

export interface ConversationThread {
  id: string;
  clientName: string;
  clientCompany: string;
  avatarColor: string;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  messages: ChatMessage[];
}

const INITIAL_THREADS: ConversationThread[] = [
  {
    id: "t-1",
    clientName: "Amit Sharma",
    clientCompany: "Skyline Corp",
    avatarColor: "bg-blue-600",
    unreadCount: 1,
    lastMessage: "Can we increase partition height from 1200mm to 1350mm?",
    lastTime: "12m ago",
    messages: [
      {
        id: "msg-1",
        sender: "client",
        text: "Hi Payal Decor team, we reviewed the initial 3D workstation render.",
        time: "10:15 AM",
      },
      {
        id: "msg-2",
        sender: "user",
        text: "Hello Mr. Sharma! Glad you liked it. How do the finishes look?",
        time: "10:20 AM",
      },
      {
        id: "msg-3",
        sender: "client",
        text: "Can we increase partition height from 1200mm to 1350mm? We need extra acoustic privacy.",
        time: "10:24 AM",
      },
    ],
  },
  {
    id: "t-2",
    clientName: "Sneha Patil",
    clientCompany: "Urban Spaces",
    avatarColor: "bg-purple-600",
    unreadCount: 1,
    lastMessage: "I scheduled the sample selection meeting for tomorrow at 3 PM.",
    lastTime: "45m ago",
    messages: [
      {
        id: "msg-201",
        sender: "user",
        text: "Hi Sneha, we have received the updated CAD drawings for the executive cabin.",
        time: "09:00 AM",
      },
      {
        id: "msg-202",
        sender: "client",
        text: "Great! I scheduled the sample selection meeting for tomorrow at 3 PM to finalize shades.",
        time: "09:45 AM",
      },
    ],
  },
  {
    id: "t-3",
    clientName: "Rajesh Verma",
    clientCompany: "Design Hub Pvt. Ltd.",
    avatarColor: "bg-emerald-600",
    unreadCount: 1,
    lastMessage: "Advance payment of ₹ 2,45,000 has been released from HDFC account.",
    lastTime: "2h ago",
    messages: [
      {
        id: "msg-301",
        sender: "client",
        text: "Advance payment of ₹ 2,45,000 has been released from HDFC account. UTR ref: 894210459.",
        time: "08:15 AM",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* HeaderActions: Interactive Calendar, Notifications, Messages        */
/* ------------------------------------------------------------------ */

export function HeaderActions({
  calendarOpenOverride,
  onCalendarOpenChange,
}: {
  calendarOpenOverride?: boolean;
  onCalendarOpenChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  // Internal state
  const [internalCalendarOpen, setInternalCalendarOpen] = useState(false);
  const isCalendarOpen = calendarOpenOverride !== undefined ? calendarOpenOverride : internalCalendarOpen;
  const setCalendarOpen = onCalendarOpenChange || setInternalCalendarOpen;

  useEffect(() => {
    const handler = () => setCalendarOpen(true);
    window.addEventListener("open-client-calendar", handler);
    return () => window.removeEventListener("open-client-calendar", handler);
  }, [setCalendarOpen]);

  const [meetings, setMeetings] = useState<ClientMeeting[]>(INITIAL_MEETINGS);
  const [meetingFilter, setMeetingFilter] = useState<"all" | "today" | "upcoming">("all");
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // New meeting form state
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newDate, setNewDate] = useState("Today, 4:00 PM");
  const [newType, setNewType] = useState<ClientMeeting["type"]>("Site Visit");
  const [newLocation, setNewLocation] = useState("");
  const [newAgenda, setNewAgenda] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Messages state
  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const totalUnreadMessages = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  // Filtered meetings
  const filteredMeetings = meetings.filter((m) => {
    if (meetingFilter === "today") return m.urgency === "today";
    if (meetingFilter === "upcoming") return m.urgency === "upcoming" || m.urgency === "tomorrow";
    return true;
  });

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) return;

    const newMeeting: ClientMeeting = {
      id: `m-${Date.now()}`,
      title: newTitle.trim(),
      clientName: newClient.trim(),
      clientCompany: newCompany.trim() || "Client Direct",
      clientRole: "Client Representative",
      date: newDate,
      time: "Scheduled",
      type: newType,
      location: newLocation.trim() || "Payal Decor HQ",
      isVirtual: newType === "Commercial",
      agenda: newAgenda.trim() || "Client modular furniture discussion.",
      status: "Scheduled by Client",
      urgency: "today",
    };

    setMeetings([newMeeting, ...meetings]);
    setShowScheduleForm(false);
    setNewTitle("");
    setNewClient("");
    setNewCompany("");
    setNewAgenda("");
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeThreadId) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: replyInput.trim(),
      time: "Just now",
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: newMsg.text,
            lastTime: "Just now",
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    setReplyInput("");
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <>
      <div className="flex items-center gap-1">
        {/* ========================================================= */}
        {/* 1. NOTIFICATIONS (BELL) POPOVER                            */}
        {/* ========================================================= */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              title="Notifications"
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer focus:outline-none"
            >
              <Bell className="size-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-in zoom-in-50">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[360px] p-0 shadow-lg border border-border bg-card rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unreadNotifCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {unreadNotifCount} new
                  </span>
                )}
              </div>
              {unreadNotifCount > 0 && (
                <button
                  onClick={handleMarkAllNotifsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                >
                  <CheckCheck className="size-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 transition-colors cursor-pointer",
                      notif.read ? "bg-card opacity-80 hover:bg-muted/40" : "bg-primary/5 hover:bg-primary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg text-xs shadow-xs",
                        notif.category === "meeting" && "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
                        notif.category === "alert" && "bg-destructive/15 text-destructive",
                        notif.category === "sales" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                        notif.category === "payment" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                        notif.category === "production" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {notif.category === "meeting" && <Calendar className="size-4" />}
                      {notif.category === "alert" && <AlertCircle className="size-4" />}
                      {notif.category === "sales" && <FileText className="size-4" />}
                      {notif.category === "payment" && <DollarSign className="size-4" />}
                      {notif.category === "production" && <Truck className="size-4" />}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={cn("text-xs leading-tight font-semibold", notif.read ? "text-foreground" : "text-primary")}>
                          {notif.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{notif.time}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.actionText && (
                        <span className="mt-1.5 inline-block text-[11px] font-semibold text-primary hover:underline">
                          {notif.actionText} →
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* ========================================================= */}
        {/* 2. CALENDAR (SCHEDULED CLIENT MEETINGS) BUTTON & MODAL     */}
        {/* ========================================================= */}
        <button
          onClick={() => setCalendarOpen(true)}
          title="Client Meetings Calendar"
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer focus:outline-none"
        >
          <Calendar className="size-5" />
          <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground animate-in zoom-in-50">
            {meetings.length}
          </span>
        </button>

        {/* ========================================================= */}
        {/* 3. MESSAGES (MESSAGESQUARE) POPOVER & CHAT DIALOG          */}
        {/* ========================================================= */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              title="Client Messages"
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer focus:outline-none"
            >
              <MessageSquare className="size-5" />
              {totalUnreadMessages > 0 && (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground animate-in zoom-in-50">
                  {totalUnreadMessages}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[360px] p-0 shadow-lg border border-border bg-card rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Client Messages</h3>
                {totalUnreadMessages > 0 && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {totalUnreadMessages} unread
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 transition-colors cursor-pointer",
                    thread.unreadCount > 0 ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-xs",
                      thread.avatarColor,
                    )}
                  >
                    {thread.clientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {thread.clientName}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{thread.lastTime}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{thread.clientCompany}</p>
                    <p className={cn("mt-1 text-xs truncate", thread.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {thread.lastMessage}
                    </p>
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ========================================================= */}
      {/* FULL CLIENT MEETINGS CALENDAR MODAL                        */}
      {/* ========================================================= */}
      <Dialog open={isCalendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="border-b border-border bg-gradient-to-r from-card via-muted/20 to-card px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shadow-xs">
                    <Calendar className="size-5" />
                  </span>
                  <div>
                    <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                      Client Meetings & Site Appointments
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Scheduled client consultations, site measurements, and project reviews
                    </DialogDescription>
                  </div>
                </div>

                <button
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>{showScheduleForm ? "Back to Meetings" : "Schedule Meeting"}</span>
                </button>
              </div>

              {/* Status Filters */}
              {!showScheduleForm && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setMeetingFilter("all")}
                    className={cn(
                      "rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                      meetingFilter === "all" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    All Meetings ({meetings.length})
                  </button>
                  <button
                    onClick={() => setMeetingFilter("today")}
                    className={cn(
                      "rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                      meetingFilter === "today" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    Today ({meetings.filter((m) => m.urgency === "today").length})
                  </button>
                  <button
                    onClick={() => setMeetingFilter("upcoming")}
                    className={cn(
                      "rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                      meetingFilter === "upcoming" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    Upcoming ({meetings.filter((m) => m.urgency !== "today").length})
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {showScheduleForm ? (
                /* Schedule Meeting Form */
                <form onSubmit={handleAddMeeting} className="space-y-4 max-w-xl mx-auto">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary flex items-center gap-2">
                    <Sparkles className="size-4 shrink-0" />
                    <span>Schedule a new client appointment or site measurement session.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Meeting Title</label>
                    <input
                      required
                      placeholder="e.g. Workstation Layout & Material Approval"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Client Name</label>
                      <input
                        required
                        placeholder="e.g. Amit Sharma"
                        value={newClient}
                        onChange={(e) => setNewClient(e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Company Name</label>
                      <input
                        placeholder="e.g. Skyline Corp"
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Date & Time</label>
                      <input
                        required
                        placeholder="e.g. Tomorrow, 2:30 PM"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Meeting Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                      >
                        <option value="Site Visit">Site Visit & Measurement</option>
                        <option value="Design Review">Design & Finish Review</option>
                        <option value="Commercial">Commercial & Quotation</option>
                        <option value="Factory Inspection">Factory Inspection</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Location / Meeting Link</label>
                    <input
                      placeholder="e.g. Skyline Towers, 4th Floor or Google Meet link"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Agenda / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Discuss 120 workstations, partition edge-banding, and timeline..."
                      value={newAgenda}
                      onChange={(e) => setNewAgenda(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowScheduleForm(false)}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Save Meeting
                    </button>
                  </div>
                </form>
              ) : (
                /* Scheduled Meetings Cards List */
                <div className="space-y-4">
                  {filteredMeetings.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "rounded-xl border p-4.5 transition-all duration-200 hover:shadow-md",
                        m.urgency === "today"
                          ? "border-primary/40 bg-gradient-to-r from-primary/5 via-card to-card"
                          : "border-border/80 bg-card hover:border-border",
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                              <Sparkles className="size-3" />
                              {m.status}
                            </span>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              {m.type}
                            </span>
                            {m.urgency === "today" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-bold text-destructive">
                                <Clock className="size-3" />
                                Today
                              </span>
                            )}
                          </div>

                          <h4 className="mt-2 text-base font-bold tracking-tight text-foreground">
                            {m.title}
                          </h4>

                          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                              <User className="size-3.5 text-primary" />
                              {m.clientName} ({m.clientRole})
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Building2 className="size-3.5 text-muted-foreground" />
                              {m.clientCompany}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="size-3.5 text-muted-foreground" />
                              {m.date} • {m.time}
                            </span>
                            {m.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="size-3.5 text-muted-foreground" />
                                {m.phone}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            {m.isVirtual ? (
                              <Video className="size-3.5 text-indigo-500 shrink-0" />
                            ) : (
                              <MapPin className="size-3.5 text-emerald-500 shrink-0" />
                            )}
                            <span className="truncate">{m.location}</span>
                          </div>

                          <p className="mt-2 rounded-lg bg-muted/50 p-2.5 text-xs text-foreground/90">
                            <span className="font-semibold text-foreground">Agenda: </span>
                            {m.agenda}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex sm:flex-col items-center gap-2 shrink-0">
                          {m.meetingLink ? (
                            <a
                              href={m.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                            >
                              <Video className="size-3.5" />
                              <span>Join Call</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => alert(`Site Visit for ${m.clientName} confirmed at: ${m.location}`)}
                              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                              <Check className="size-3.5" />
                              <span>Confirm Visit</span>
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Reschedule request sent to ${m.clientName}`)}
                            className="flex w-full items-center justify-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                          >
                            <span>Reschedule</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DIRECT CHAT CONVERSATION POPUP DIALOG                      */}
      {/* ========================================================= */}
      {activeThread && (
        <Dialog open={!!activeThread} onOpenChange={(open) => !open && setActiveThreadId(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "grid size-9 place-items-center rounded-full text-xs font-bold text-white shadow-xs",
                    activeThread.avatarColor,
                  )}
                >
                  {activeThread.clientName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground leading-tight">
                    {activeThread.clientName}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{activeThread.clientCompany}</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-[320px] overflow-y-auto p-4 space-y-3 bg-muted/10">
              {activeThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.sender === "user" ? "ml-auto items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2 text-xs shadow-xs",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-xs"
                        : "bg-card border border-border text-foreground rounded-bl-xs",
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendReply} className="flex items-center gap-2 border-t border-border p-3 bg-card">
              <input
                placeholder={`Reply to ${activeThread.clientName}...`}
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs outline-none focus:border-primary focus:bg-card"
              />
              <button
                type="submit"
                disabled={!replyInput.trim()}
                className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs disabled:opacity-50 hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Send className="size-4" />
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
