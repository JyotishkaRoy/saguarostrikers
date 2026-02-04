import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { UserPlus, Trash2, ArrowLeft, Users } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Participant {
  outreachParticipantId: string;
  outreachId: string;
  userId: string;
  role?: string;
  addedAt: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

interface Outreach {
  outreachId: string;
  title: string;
}

export default function AdminOutreachParticipants() {
  const [searchParams] = useSearchParams();
  const outreachId = searchParams.get('outreachId');

  const [outreach, setOutreach] = useState<Outreach | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (outreachId) {
      fetchOutreach();
      fetchParticipants();
      fetchActiveUsers();
    }
  }, [outreachId]);

  const fetchOutreach = async () => {
    if (!outreachId) return;
    try {
      const res = await api.get(`/admin/outreaches/${outreachId}`);
      if (res.success && res.data) setOutreach(res.data as Outreach);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const fetchParticipants = async () => {
    if (!outreachId) return;
    try {
      setLoading(true);
      const res = await api.get(`/admin/outreaches/${outreachId}/participants`);
      if (res.success && res.data) setParticipants(res.data as Participant[]);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const res = await api.get('/admin/users?status=active');
      if (res.success && res.data) setActiveUsers(res.data as User[]);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleAdd = async () => {
    if (!outreachId || !selectedUserId) {
      toast.error('Select a user to add');
      return;
    }
    try {
      setAdding(true);
      await api.post(`/admin/outreaches/${outreachId}/participants`, { userId: selectedUserId });
      toast.success('Participant added');
      setSelectedUserId('');
      fetchParticipants();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!outreachId || !confirm('Remove this participant?')) return;
    try {
      await api.delete(`/admin/outreaches/${outreachId}/participants/${userId}`);
      toast.success('Participant removed');
      fetchParticipants();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const availableUsers = activeUsers.filter(
    u => !participants.some(p => p.userId === u.userId)
  );

  if (!outreachId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">No outreach selected. <Link to="/admin/outreaches" className="text-primary-600 underline">Go to Outreaches</Link></p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/outreaches" className="btn-outline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Outreaches
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {outreach?.title ?? 'Outreach'} – Coordinators
        </h1>
        <p className="text-gray-600">Add or remove participants from existing active users.</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add participant
        </h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select user</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="input w-full"
            >
              <option value="">Choose an active user…</option>
              {availableUsers.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !selectedUserId}
            className="btn-primary flex items-center gap-2"
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
        {availableUsers.length === 0 && activeUsers.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">All active users are already participants.</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Current participants ({participants.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : participants.length === 0 ? (
          <p className="text-gray-500 py-4">No participants yet. Add users above.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {participants.map((p) => (
              <li key={p.outreachParticipantId} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <span className="font-medium">
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="text-gray-500 ml-2">({p.email})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(p.userId)}
                  className="btn-danger text-sm py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
