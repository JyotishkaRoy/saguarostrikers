import { useAuthStore } from '@/store/authStore';
import { User, Mail, Phone, Calendar, Shield, Edit } from 'lucide-react';
import { useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/user/profile', formData);
      toast.success('Profile updated successfully');
      setIsEditMode(false);
      // Refresh user data here if needed
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">View and manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-primary-600" />
                  <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                    {user.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                </div>
              </div>
            </div>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="btn-outline flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {isEditMode ? (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setFormData({
                      firstName: user?.firstName || '',
                      lastName: user?.lastName || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                    });
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    First Name
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-lg">{user.firstName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Last Name
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-lg">{user.lastName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-lg">{user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Phone
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-lg">{user.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Role
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span className="text-lg capitalize">{user.role}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-lg">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Status */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${user.status === 'active' ? 'bg-success-500' : 'bg-danger-500'}`}></div>
            <span className="text-gray-700">
              Your account is <strong>{user.status === 'active' ? 'Active' : 'Inactive'}</strong>
            </span>
          </div>
        </div>

        {/* Additional Info for Admins */}
        {user.role === 'admin' && (
          <div className="card mt-6 bg-primary-50 border-primary-200">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                  Administrator Access
                </h3>
                <p className="text-primary-700">
                  You have full administrative privileges to manage users, competitions, content, and all other aspects of the platform.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
