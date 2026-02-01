import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  ArrowRight,
  Users,
  Package,
  Image as ImageIcon,
  MessageCircle,
  ChevronRight,
  Download,
  Video,
  Play,
  User,
  Send,
  Lock,
  Pencil,
  X,
  Trash2,
} from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface Mission {
  missionId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  imageUrl?: string;
}

type TabId = 'events' | 'team' | 'artifacts' | 'galleries' | 'discussions';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'events', label: 'Events', icon: <Calendar className="h-4 w-4" /> },
  { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" /> },
  { id: 'artifacts', label: 'Artifacts', icon: <Package className="h-4 w-4" /> },
  { id: 'galleries', label: 'Galleries', icon: <ImageIcon className="h-4 w-4" /> },
  { id: 'discussions', label: 'Discussions', icon: <MessageCircle className="h-4 w-4" /> },
];

function getMissionStatus(startDate: string, endDate: string, status: string): string {
  if (status !== 'published' && status !== 'in-progress' && status !== 'completed') return status;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < now) return 'completed';
  if (start <= now && end >= now) return 'in-progress';
  return 'upcoming';
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
    case 'in-progress':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function UserMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('events');
  const [isLoadingMissions, setIsLoadingMissions] = useState(true);
  const [tabData, setTabData] = useState<{
    events: any[];
    subEvents: any[];
    team: any[];
    artifacts: any[];
    galleries: any[];
    discussions: any[];
  }>({ events: [], subEvents: [], team: [], artifacts: [], galleries: [], discussions: [] });
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedThreadDetail, setSelectedThreadDetail] = useState<any | null>(null);
  const [loadingThreadDetail, setLoadingThreadDetail] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMyMissions();
  }, []);

  useEffect(() => {
    if (selectedMission) {
      fetchTabData(selectedMission, activeTab);
    } else {
      setTabData({ events: [], subEvents: [], team: [], artifacts: [], galleries: [], discussions: [] });
      setSelectedThreadId(null);
      setSelectedThreadDetail(null);
    }
  }, [selectedMission?.missionId, activeTab]);

  useEffect(() => {
    if (activeTab === 'discussions') {
      setSelectedThreadId(null);
      setSelectedThreadDetail(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedThreadId || activeTab !== 'discussions') return;
    const fetchThreadDetail = async () => {
      setLoadingThreadDetail(true);
      try {
        const res = await api.get(`/discussions/${selectedThreadId}`);
        if (res.success && res.data) setSelectedThreadDetail(res.data);
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoadingThreadDetail(false);
      }
    };
    fetchThreadDetail();
  }, [selectedThreadId, activeTab]);

  const fetchMyMissions = async () => {
    try {
      setIsLoadingMissions(true);
      const response = await api.get('/user/my-missions');
      if (response.success && response.data && Array.isArray(response.data)) {
        const list = response.data as Mission[];
        setMissions(list);
        if (list.length > 0 && !selectedMission) {
          setSelectedMission(list[0]);
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoadingMissions(false);
    }
  };

  const fetchTabData = async (mission: Mission, tab: TabId) => {
    setIsLoadingTab(true);
    try {
      if (tab === 'events') {
        const [eventsRes, missionRes] = await Promise.all([
          api.get(`/public/calendar-events/mission/${mission.missionId}`),
          api.get(`/public/missions/${mission.missionId}`),
        ]);
        const events = eventsRes.success && eventsRes.data ? (eventsRes.data as any[]) : [];
        const subEvents =
          missionRes.success && missionRes.data && (missionRes.data as any).subEvents
            ? (missionRes.data as any).subEvents
            : [];
        setTabData((prev) => ({ ...prev, events, subEvents }));
      } else if (tab === 'team') {
        const res = await api.get(`/public/join-mission/mission/${mission.missionId}`);
        const team =
          res.success && res.data
            ? (res.data as any[]).filter((a: any) => a.status === 'approved')
            : [];
        setTabData((prev) => ({ ...prev, team }));
      } else if (tab === 'artifacts') {
        const res = await api.get(`/public/missions/${mission.slug}/artifacts`);
        const artifacts = res.success && res.data ? (res.data as any[]) : [];
        setTabData((prev) => ({ ...prev, artifacts }));
      } else if (tab === 'galleries') {
        const res = await api.get(`/public/missions/${mission.slug}/gallery`);
        const galleries = res.success && res.data ? (res.data as any[]) : [];
        setTabData((prev) => ({ ...prev, galleries }));
      } else if (tab === 'discussions') {
        const res = await api.get(`/discussions?missionId=${mission.missionId}&limit=100`);
        const discussions = res.success && res.data && Array.isArray(res.data) ? (res.data as any[]) : [];
        setTabData((prev) => ({ ...prev, discussions }));
      } else {
        setTabData((prev) => prev);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoadingTab(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Missions</h1>
        <p className="text-gray-600 mt-1">Select a mission to view events, team, artifacts, and more.</p>
      </div>

      {isLoadingMissions ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : missions.length === 0 ? (
        <div className="card text-center py-12 max-w-2xl mx-auto">
          <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No missions yet</h3>
          <p className="text-gray-600 mb-6">
            You haven’t been approved for any missions. Apply from the Missions page and an admin will review your application.
          </p>
          <Link to="/missions" className="btn-primary inline-flex items-center gap-2">
            Browse missions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: compact mission cards stacked */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="space-y-2">
              {missions.map((mission) => {
                const status = getMissionStatus(mission.startDate, mission.endDate, mission.status);
                const isSelected = selectedMission?.missionId === mission.missionId;
                return (
                  <button
                    key={mission.missionId}
                    type="button"
                    onClick={() => setSelectedMission(mission)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                      isSelected
                        ? 'border-primary-600 bg-primary-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="h-12 w-16 flex-shrink-0 rounded-md overflow-hidden bg-primary-100">
                      {mission.imageUrl && !mission.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <img
                          src={mission.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{mission.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(mission.startDate).toLocaleDateString()} – {new Date(mission.endDate).toLocaleDateString()}
                      </p>
                      <span className={cn('inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium', getStatusClass(status))}>
                        {status === 'in-progress' ? 'In Progress' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                    <ChevronRight
                      className={cn('h-5 w-5 flex-shrink-0 text-gray-400', isSelected && 'text-primary-600')}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: tabs + content */}
          <div className="flex-1 min-w-0">
            <div className="card overflow-hidden">
              {selectedMission ? (
                <>
                  <div className="border-b border-gray-200 bg-gray-50/80">
                    <nav className="flex gap-1 p-2" aria-label="Tabs">
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                            activeTab === tab.id
                              ? 'bg-white text-primary-700 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                          )}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                  <div className="p-6 min-h-[320px]">
                    {isLoadingTab ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent"></div>
                      </div>
                    ) : (
                      <>
                        {activeTab === 'events' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Calendar events & sub-events</h3>
                            {tabData.events.length === 0 && tabData.subEvents.length === 0 ? (
                              <p className="text-gray-500">No events for this mission.</p>
                            ) : (
                              <ul className="space-y-4">
                                {tabData.events.map((ev: any) => {
                                  const dateStr = ev.date || ev.startDate;
                                  const timeStr = [ev.startTime, ev.endTime].filter(Boolean).join(' – ');
                                  return (
                                    <li key={ev.eventId} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                                      <div className="flex gap-3">
                                        <Calendar className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-gray-900">{ev.title}</p>
                                            {ev.type && (
                                              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 capitalize">
                                                {ev.type}
                                              </span>
                                            )}
                                            {ev.status && (
                                              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                                                {ev.status}
                                              </span>
                                            )}
                                          </div>
                                          {ev.description && (
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{ev.description}</p>
                                          )}
                                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                            {dateStr && (
                                              <span>
                                                📅 {new Date(dateStr).toLocaleDateString(undefined, {
                                                  weekday: 'short',
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                })}
                                                {timeStr && ` · ${timeStr}`}
                                              </span>
                                            )}
                                            {ev.location && (
                                              <span>📍 {ev.location}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                                {tabData.subEvents.map((ev: any) => (
                                  <li key={ev.subEventId} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                                    <div className="flex gap-3">
                                      <Calendar className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                      <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="font-semibold text-gray-900">{ev.title}</p>
                                          {ev.status && (
                                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                                              {ev.status}
                                            </span>
                                          )}
                                        </div>
                                        {ev.description && (
                                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{ev.description}</p>
                                        )}
                                        {ev.eventDate && (
                                          <p className="text-sm text-gray-500">
                                            📅 {new Date(ev.eventDate).toLocaleString(undefined, {
                                              weekday: 'short',
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                              hour: 'numeric',
                                              minute: '2-digit',
                                            })}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        {activeTab === 'team' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Mission scientists</h3>
                            {tabData.team.length === 0 ? (
                              <p className="text-gray-500">No team members listed for this mission.</p>
                            ) : (
                              <ul className="space-y-2">
                                {tabData.team.map((s: any) => (
                                  <li key={s.applicationId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <Users className="h-5 w-5 text-primary-600 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {s.studentFirstName} {s.studentLastName}
                                      </p>
                                      <p className="text-sm text-gray-500">{s.studentEmail}</p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        {activeTab === 'artifacts' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Artifacts</h3>
                            {tabData.artifacts.length === 0 ? (
                              <p className="text-gray-500">No artifacts for this mission.</p>
                            ) : (
                              <ul className="space-y-3">
                                {tabData.artifacts.map((a: any) => {
                                  const downloadUrl = a.filePath ? `/uploads/${a.filePath}` : null;
                                  const displayName = a.originalFileName || a.fileName || a.description || 'Artifact';
                                  return (
                                    <li
                                      key={a.artifactId}
                                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50/50"
                                    >
                                      <Package className="h-8 w-8 text-primary-600 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900">{displayName}</p>
                                        {a.description && (
                                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>
                                        )}
                                        {a.fileSize != null && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {(a.fileSize / 1024).toFixed(1)} KB
                                          </p>
                                        )}
                                      </div>
                                      {downloadUrl && (
                                        <a
                                          href={downloadUrl}
                                          download={a.originalFileName || undefined}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors flex-shrink-0"
                                        >
                                          <Download className="h-4 w-4" />
                                          Download
                                        </a>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        )}
                        {activeTab === 'galleries' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Gallery</h3>
                            {tabData.galleries.length === 0 ? (
                              <p className="text-gray-500">No gallery items for this mission.</p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {tabData.galleries.map((img: any) => {
                                  const imageSrc = img.imageUrl
                                    ? img.imageUrl.startsWith('/uploads')
                                      ? img.imageUrl
                                      : `/uploads/${img.imageUrl}`
                                    : null;
                                  const isVideo =
                                    imageSrc &&
                                    /\.(mp4|webm|ogg|mov)$/i.test(
                                      img.imageUrl || imageSrc
                                    );
                                  return (
                                    <Link
                                      key={img.galleryId}
                                      to={`/missions/${selectedMission?.slug}/gallery`}
                                      className="group relative block aspect-square rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200 hover:ring-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                      {imageSrc ? (
                                        isVideo ? (
                                          <>
                                            <video
                                              src={imageSrc}
                                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                              muted
                                              loop
                                              playsInline
                                              preload="metadata"
                                              onMouseEnter={(e) => e.currentTarget.play()}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.pause();
                                                e.currentTarget.currentTime = 0;
                                              }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                              <span className="rounded-full bg-white/90 p-2">
                                                <Play className="h-6 w-6 text-primary-600 fill-primary-600" />
                                              </span>
                                            </div>
                                            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white flex items-center gap-1">
                                              <Video className="h-3 w-3" />
                                              Video
                                            </span>
                                          </>
                                        ) : (
                                          <img
                                            src={imageSrc}
                                            alt={img.title || 'Gallery image'}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                        )
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                          <ImageIcon className="h-10 w-10 text-gray-400" />
                                        </div>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                        {activeTab === 'discussions' && (
                          <div className="flex flex-col h-[min(70vh,600px)]">
                            <h3 className="font-semibold text-gray-900 mb-3">Mission discussions</h3>
                            {tabData.discussions.length === 0 ? (
                              <p className="text-gray-500 py-6">No discussions for this mission yet.</p>
                            ) : (
                              <div className="flex flex-1 min-h-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
                                {/* Left: discussion names (Teams-style) */}
                                <div className="w-64 sm:w-72 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50/80">
                                  <div className="p-2 border-b border-gray-200 text-sm font-medium text-gray-700">
                                    Discussions
                                  </div>
                                  <ul className="flex-1 overflow-y-auto">
                                    {tabData.discussions.map((t: any) => {
                                      const isSelected = selectedThreadId === t.threadId;
                                      return (
                                        <li key={t.threadId}>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedThreadId(t.threadId)}
                                            className={cn(
                                              'w-full text-left px-4 py-3 border-b border-gray-100 transition-colors flex items-center gap-2',
                                              isSelected
                                                ? 'bg-primary-50 text-primary-800 border-l-2 border-l-primary-600'
                                                : 'hover:bg-gray-100 text-gray-800'
                                            )}
                                          >
                                            <MessageCircle className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                            <span className="truncate flex-1 font-medium">{t.title}</span>
                                            {t.replyCount != null && t.replyCount > 0 && (
                                              <span className="text-xs text-gray-500 flex-shrink-0">{t.replyCount}</span>
                                            )}
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                {/* Right: messages from selected discussion */}
                                <div className="flex-1 flex flex-col min-w-0">
                                  {!selectedThreadId ? (
                                    <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
                                      Select a discussion to view messages
                                    </div>
                                  ) : loadingThreadDetail ? (
                                    <div className="flex-1 flex items-center justify-center p-6">
                                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
                                    </div>
                                  ) : selectedThreadDetail ? (
                                    <>
                                      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <h4 className="font-semibold text-gray-900">{selectedThreadDetail.title}</h4>
                                            {selectedThreadDetail.description && (
                                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {selectedThreadDetail.description}
                                              </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                              <span>{selectedThreadDetail.replyCount ?? 0} replies</span>
                                              {selectedThreadDetail.isLocked && (
                                                <span className="flex items-center gap-1 text-amber-600">
                                                  <Lock className="h-3 w-3" /> Locked
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                        {selectedThreadDetail.replies && selectedThreadDetail.replies.length > 0 ? (
                                          selectedThreadDetail.replies.map((reply: any) => (
                                            <div key={reply.replyId} className="flex gap-3">
                                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                <User className="h-4 w-4 text-primary-600" />
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="font-medium text-gray-900">
                                                    {reply.authorName && reply.authorEmail && reply.authorName !== reply.authorEmail
                                                      ? `${reply.authorName} | ${reply.authorEmail}`
                                                      : (reply.authorEmail || reply.authorName || 'User')}
                                                  </span>
                                                  {reply.authorRole === 'admin' && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary-100 text-primary-800">
                                                      Admin
                                                    </span>
                                                  )}
                                                  {user?.userId === reply.authorId && !selectedThreadDetail.isLocked && (
                                                    editingReplyId === reply.replyId ? (
                                                      <span className="flex items-center gap-1 ml-auto">
                                                        <button
                                                          type="button"
                                                          onClick={() => { setEditingReplyId(null); setEditingContent(''); }}
                                                          className="text-xs text-gray-500 hover:text-gray-700"
                                                        >
                                                          <X className="h-3.5 w-3.5" /> Cancel
                                                        </button>
                                                      </span>
                                                    ) : (
                                                      <button
                                                        type="button"
                                                        onClick={() => { setEditingReplyId(reply.replyId); setEditingContent(reply.content); }}
                                                        className="text-xs text-primary-600 hover:text-primary-700 ml-auto"
                                                        title="Edit message"
                                                      >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                      </button>
                                                    )
                                                  )}
                                                  {user?.role === 'admin' && (
                                                    <button
                                                      type="button"
                                                      onClick={async () => {
                                                        if (!selectedThreadId || !window.confirm('Delete this message?')) return;
                                                        setDeletingReplyId(reply.replyId);
                                                        try {
                                                          await api.delete(`/admin/discussions/${selectedThreadId}/replies/${reply.replyId}`);
                                                          toast.success('Message deleted');
                                                          const res = await api.get(`/discussions/${selectedThreadId}`);
                                                          if (res.success && res.data) setSelectedThreadDetail(res.data);
                                                          const listRes = await api.get(`/discussions?missionId=${selectedMission?.missionId}&limit=100`);
                                                          if (listRes.success && listRes.data && Array.isArray(listRes.data)) {
                                                            setTabData((prev) => ({ ...prev, discussions: listRes.data }));
                                                          }
                                                        } catch (err) {
                                                          toast.error(getErrorMessage(err));
                                                        } finally {
                                                          setDeletingReplyId(null);
                                                        }
                                                      }}
                                                      disabled={deletingReplyId === reply.replyId}
                                                      className="text-xs text-red-600 hover:text-red-700 ml-auto"
                                                      title="Delete message (admin)"
                                                    >
                                                      <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                  )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                  {new Date(reply.createdAt).toLocaleString()}
                                                </p>
                                                {editingReplyId === reply.replyId ? (
                                                  <div className="mt-2">
                                                    <textarea
                                                      value={editingContent}
                                                      onChange={(e) => setEditingContent(e.target.value)}
                                                      className="input w-full text-sm resize-none"
                                                      rows={3}
                                                      minLength={1}
                                                      autoFocus
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                      <button
                                                        type="button"
                                                        onClick={async () => {
                                                          if (!editingContent.trim()) return;
                                                          setIsSavingEdit(true);
                                                          try {
                                                            await api.put(`/discussions/${selectedThreadId}/replies/${reply.replyId}`, { content: editingContent.trim() });
                                                            toast.success('Message updated');
                                                            setEditingReplyId(null);
                                                            setEditingContent('');
                                                            const res = await api.get(`/discussions/${selectedThreadId}`);
                                                            if (res.success && res.data) setSelectedThreadDetail(res.data);
                                                          } catch (err) {
                                                            toast.error(getErrorMessage(err));
                                                          } finally {
                                                            setIsSavingEdit(false);
                                                          }
                                                        }}
                                                        disabled={isSavingEdit || !editingContent.trim()}
                                                        className="btn-primary text-sm"
                                                      >
                                                        {isSavingEdit ? 'Saving...' : 'Save'}
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => { setEditingReplyId(null); setEditingContent(''); }}
                                                        className="btn-outline text-sm"
                                                      >
                                                        Cancel
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap break-words">
                                                    {reply.content}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-gray-500 text-sm">No messages yet. Be the first to reply.</p>
                                        )}
                                      </div>
                                      {selectedThreadDetail.isLocked ? (
                                        <div className="p-4 border-t border-gray-200 bg-white text-sm text-gray-500">
                                          This discussion is locked. No new replies.
                                        </div>
                                      ) : (
                                        <form
                                          className="p-4 border-t border-gray-200 bg-white flex-shrink-0"
                                          onSubmit={async (e) => {
                                            e.preventDefault();
                                            if (!replyContent.trim()) {
                                              toast.error('Enter a message');
                                              return;
                                            }
                                            try {
                                              setIsSubmittingReply(true);
                                              await api.post(`/discussions/${selectedThreadId}/replies`, {
                                                content: replyContent.trim(),
                                              });
                                              toast.success('Reply posted');
                                              setReplyContent('');
                                              const res = await api.get(`/discussions/${selectedThreadId}`);
                                              if (res.success && res.data) setSelectedThreadDetail(res.data);
                                              const listRes = await api.get(
                                                `/discussions?missionId=${selectedMission?.missionId}&limit=100`
                                              );
                                              if (listRes.success && listRes.data && Array.isArray(listRes.data)) {
                                                setTabData((prev) => ({ ...prev, discussions: listRes.data }));
                                              }
                                            } catch (err) {
                                              toast.error(getErrorMessage(err));
                                            } finally {
                                              setIsSubmittingReply(false);
                                            }
                                          }}
                                        >
                                          <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Type a message..."
                                            className="input w-full text-sm resize-none"
                                            rows={2}
                                            minLength={1}
                                            required
                                          />
                                          <div className="flex justify-end mt-2">
                                            <button
                                              type="submit"
                                              disabled={isSubmittingReply}
                                              className="btn-primary text-sm inline-flex items-center gap-2"
                                            >
                                              <Send className="h-4 w-4" />
                                              {isSubmittingReply ? 'Sending...' : 'Send'}
                                            </button>
                                          </div>
                                        </form>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
                                      Could not load this discussion.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a mission from the list to view events, team, artifacts, galleries, and discussions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
