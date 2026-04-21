import { useState, useEffect } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { User } from '@/types';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserPlus, Edit, Trash2, Eye, CheckCircle, XCircle, Search, Upload, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  password?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
    status: 'active',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/admin/users');
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setCurrentUser(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      status: 'active',
      password: '',
    });
    setProfileImage(null);
    setProfileImagePreview('');
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });
    setProfileImage(null);
    // Set preview to existing profile image if available
    setProfileImagePreview(user.profileImageUrl || '');
    setIsModalOpen(true);
  };

  const handleViewClick = (user: User) => {
    setCurrentUser(user);
    setIsViewModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let userId: string;

      if (currentUser) {
        // Update existing user
        const response = await api.put<User>(`/admin/users/${currentUser.userId}`, formData);
        if (response.success) {
          userId = currentUser.userId;
          
          // Upload profile image if one was selected
          if (profileImage) {
            try {
              // Use axios directly for file upload (bypass api wrapper's default headers)
              const imageFormData = new FormData();
              imageFormData.append('file', profileImage);
              
              const token = sessionStorage.getItem('token');
              const response = await fetch(`${getApiBaseUrl()}/admin/users/${userId}/upload-profile-image`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                body: imageFormData,
              });
              
              if (!response.ok) {
                toast.error('User updated but failed to upload profile image');
              }
            } catch (uploadError) {
              console.error('Image upload error:', uploadError);
              toast.error('User updated but failed to upload profile image');
            }
          }
          
          toast.success('User updated successfully!');
          setIsModalOpen(false);
          fetchUsers();
        }
      } else {
        // Create new user
        if (!formData.password) {
          toast.error('Password is required for new users');
          setFormLoading(false);
          return;
        }
        const response = await api.post<User>('/admin/users', formData);
        if (response.success && response.data) {
          userId = response.data.userId;
          
          // Upload profile image if one was selected
          if (profileImage) {
            try {
              // Use fetch directly for file upload (bypass api wrapper's default headers)
              const imageFormData = new FormData();
              imageFormData.append('file', profileImage);
              
              const token = sessionStorage.getItem('token');
              const uploadResponse = await fetch(`${getApiBaseUrl()}/admin/users/${userId}/upload-profile-image`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                body: imageFormData,
              });
              
              if (!uploadResponse.ok) {
                toast.error('User created but failed to upload profile image');
              }
            } catch (uploadError) {
              console.error('Image upload error:', uploadError);
              toast.error('User created but failed to upload profile image');
            }
          }
          
          toast.success('User created successfully!');
          setIsModalOpen(false);
          fetchUsers();
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.success) {
        toast.success('User deleted successfully!');
        fetchUsers();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await api.put<User>(`/admin/users/${user.userId}`, {
        status: newStatus,
      });
      if (response.success) {
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <button onClick={handleCreateClick} className="btn-primary">
          <UserPlus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {users.filter((u) => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {users.filter((u) => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {users.filter((u) => u.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewClick(user)}
                        className="text-primary-600 hover:text-primary-900 p-1 rounded-md hover:bg-primary-50"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="Edit User"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={cn(
                          'p-1 rounded-md',
                          user.status === 'active'
                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        )}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'active' ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId)}
                        className="text-danger-600 hover:text-danger-900 p-1 rounded-md hover:bg-danger-50"
                        title="Delete User"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentUser ? 'Edit User' : 'Create New User'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Profile Image Upload */}
            <div>
              <label className="form-label">Profile Picture</label>
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <UserCircle className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="flex-1">
                  <label
                    htmlFor="profileImage"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium text-gray-700">
                      {profileImage ? 'Change Image' : 'Upload Image'}
                    </span>
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                  {profileImage && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ New image selected: {profileImage.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {!currentUser && (
              <div>
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!currentUser}
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="form-label">
                  Role *
                </label>
                <select
                  id="role"
                  className="input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="form-label">
                  Status *
                </label>
                <select
                  id="status"
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : currentUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="User Details">
        {currentUser && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <p className="text-gray-900 font-medium">
                {currentUser.firstName} {currentUser.lastName}
              </p>
            </div>
            <div>
              <label className="form-label">Email</label>
              <p className="text-gray-900">{currentUser.email}</p>
            </div>
            <div>
              <label className="form-label">Phone</label>
              <p className="text-gray-900">{currentUser.phone || '—'}</p>
            </div>
            <div>
              <label className="form-label">Role</label>
              <span
                className={cn(
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  currentUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                )}
              >
                {currentUser.role}
              </span>
            </div>
            <div>
              <label className="form-label">Status</label>
              <span
                className={cn(
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  currentUser.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {currentUser.status}
              </span>
            </div>
            <div>
              <label className="form-label">Created At</label>
              <p className="text-gray-900">
                {new Date(currentUser.createdAt).toLocaleString('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            {currentUser.lastLogin && (
              <div>
                <label className="form-label">Last Login</label>
                <p className="text-gray-900">
                  {new Date(currentUser.lastLogin).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
