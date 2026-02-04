import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X as XIcon, Upload, Image as ImageIcon, Mail, UserPlus, User as UserIcon } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import type { BoardMember, User } from '@/types';
import axios from 'axios';

export default function AdminBoardMembers() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    email: '',
    imageUrl: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchBoardMembers();
    fetchUsers();
  }, []);

  // Helper function to get the display image for a board member
  const getDisplayImage = (member: BoardMember): string | null => {
    // Priority: 1. Board member's own image, 2. User's profile picture, 3. null (default icon)
    if (member.imageUrl) {
      return member.imageUrl;
    }
    
    // Find the user by email and use their profile picture
    const user = users.find(u => u.email === member.email);
    return user?.profileImageUrl || null;
  };

  const fetchBoardMembers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<BoardMember[]>('/admin/board-members');
      if (response.success && response.data) {
        setBoardMembers(response.data.sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get<User[]>('/admin/users');
      if (response.success && response.data) {
        // Filter out inactive users
        setUsers(response.data.filter(u => u.status === 'active'));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Get available users (exclude those already assigned as board members)
  const getAvailableUsers = () => {
    // Get emails of assigned board members, excluding the one being edited
    const assignedEmails = boardMembers
      .filter(member => !editingMember || member.boardMemberId !== editingMember.boardMemberId)
      .map(member => member.email.toLowerCase());
    return users.filter(user => !assignedEmails.includes(user.email.toLowerCase()));
  };

  const handleOpenModal = (member?: BoardMember) => {
    if (member) {
      setEditingMember(member);
      // Find the user ID associated with this board member
      const associatedUser = users.find(u => u.email.toLowerCase() === member.email.toLowerCase());
      setSelectedUserId(associatedUser?.userId || '');
      setFormData({
        name: member.name,
        position: member.position,
        bio: member.bio,
        email: member.email,
        imageUrl: member.imageUrl || '',
        status: member.status
      });
    } else {
      setEditingMember(null);
      setSelectedUserId('');
      setFormData({
        name: '',
        position: '',
        bio: '',
        email: '',
        imageUrl: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setSelectedUserId('');
    setFormData({
      name: '',
      position: '',
      bio: '',
      email: '',
      imageUrl: '',
      status: 'active'
    });
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.userId === userId);
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        // Show user's profile picture as preview (can be overridden by uploading leader-specific image)
        imageUrl: user.profileImageUrl || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for adding new leader
    if (!editingMember && !selectedUserId) {
      toast.error('Please select a user from the list');
      return;
    }

    if (!formData.name || !formData.position || !formData.bio || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingMember) {
        await api.put(`/admin/board-members/${editingMember.boardMemberId}`, formData);
        toast.success('Leader updated successfully');
      } else {
        await api.post('/admin/board-members', formData);
        toast.success('Leader added successfully');
      }
      handleCloseModal();
      fetchBoardMembers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this leader?')) return;

    try {
      await api.delete(`/admin/board-members/${memberId}`);
      toast.success('Leader deleted successfully');
      fetchBoardMembers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = sessionStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/admin/board-members/upload-leader-image`,
        formDataUpload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const imageUrl = response.data.data.url;
        setFormData(prev => ({ ...prev, imageUrl }));
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mission Leaders</h1>
          <p className="text-gray-600">Manage team leaders and board members</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Leader
        </button>
      </div>

      {/* Board Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boardMembers.map((member) => (
          <div key={member.boardMemberId} className="card group hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700 rounded-t-lg overflow-hidden">
              {getDisplayImage(member) ? (
                <img
                  src={getDisplayImage(member)!}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100">
                  <UserIcon className="h-24 w-24 text-primary-600" />
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`badge-${member.status === 'active' ? 'success' : 'warning'}`}>
                  {member.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-primary-600 font-medium mb-3">{member.position}</p>
              
              {/* Email */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${member.email}`} className="hover:text-primary-600">
                  {member.email}
                </a>
              </div>

              {/* Bio Preview */}
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{member.bio}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(member)}
                  className="btn-outline flex-1 text-sm py-2"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.boardMemberId)}
                  className="btn-danger text-sm py-2 px-4"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {boardMembers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <ImageIcon className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">No leaders added yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Leader
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingMember ? 'Edit Leader' : 'Add New Leader'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Selector - Available in both Add and Edit modes */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-primary-900 mb-2 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Select User <span className="text-danger-600">*</span>
              </label>
              {loadingUsers ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  Loading users...
                </div>
              ) : (
                <>
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleUserSelect(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">-- Select a user --</option>
                    {getAvailableUsers().map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                  {getAvailableUsers().length === 0 && (
                    <p className="text-xs text-orange-600 mt-2">
                      ⚠️ All active users are already assigned as leaders
                    </p>
                  )}
                </>
              )}
              <p className="text-xs text-primary-700 mt-2">
                {editingMember 
                  ? 'Change the user assigned to this leadership position. The dropdown shows available users (excluding other assigned leaders).'
                  : 'Select a registered user to assign as a mission leader. Users already assigned as leaders are hidden.'}
              </p>
            </div>

            {/* Name - Auto-populated from user selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leader Name <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full bg-gray-50"
                placeholder="Select a user from the dropdown above"
                required
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                📌 Auto-populated from selected user above
              </p>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position/Designation <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="input w-full"
                placeholder="President & Founder"
                required
              />
            </div>

            {/* Email - Auto-populated from user selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leader Email <span className="text-danger-600">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input w-full bg-gray-50"
                placeholder="Select a user from the dropdown above"
                required
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                📌 Auto-populated from selected user above
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio <span className="text-danger-600">*</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input w-full"
                rows={4}
                placeholder="Brief biography about the leader..."
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              
              {/* Image Preview - Always show */}
              <div className="mb-3">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500 mx-auto">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <UserIcon className="h-16 w-16 text-primary-600" />
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  {formData.imageUrl ? 'Current photo' : 'No photo uploaded'}
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600 text-center">
                    Upload profile photo (max 5MB)
                  </p>
                  <label
                    htmlFor="image-upload"
                    className={`btn-primary cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              </div>

              {formData.imageUrl && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="text-sm text-danger-600 hover:text-danger-800"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="input w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                {editingMember ? 'Update Leader' : 'Add Leader'}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn-outline flex items-center gap-2"
              >
                <XIcon className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </Modal>
    </div>
  );
}
