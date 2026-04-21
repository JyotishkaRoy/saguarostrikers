import { useAuthStore } from '@/store/authStore';
import { User, Mail, Phone, Calendar, Shield, Edit, Lock } from 'lucide-react';
import { useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface UploadResult {
  url: string;
}

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('📤 Starting profile update...');
      console.log('Profile image:', profileImage);
      console.log('User ID:', user?.userId);
      
      // Upload profile image if selected
      if (profileImage) {
        console.log('🖼️ Uploading profile image...');
        const uploadResponse = await api.uploadFile<UploadResult>('/user/upload-profile-image', profileImage, {
          userId: user?.userId
        });
        
        console.log('Upload response:', uploadResponse);
        
        if (uploadResponse.success && uploadResponse.data?.url) {
          console.log('✅ Image uploaded, updating profile...');
          // Update user profile with new image URL
          await api.put('/user/profile', {
            ...formData,
            profileImageUrl: uploadResponse.data.url
          });
        }
      } else {
        console.log('📝 No image, updating profile only...');
        await api.put('/user/profile', formData);
      }
      
      toast.success('Profile updated successfully');
      setIsEditMode(false);
      setProfileImage(null);
      setImagePreview(null);
      // Refresh user data here if needed
      window.location.reload(); // Reload to show updated profile
    } catch (error) {
      console.error('❌ Profile update error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('📁 File selected:', file);
    
    if (file) {
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      console.log('✅ File validation passed, setting state...');
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('🖼️ Preview created');
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await api.post('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Profile</h1>
          </div>
          <p className="text-lg text-gray-600">View and manage your personal information</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2">
            {/* Profile Card */}
            <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-2 border-primary-200">
                  {(imagePreview || user.profileImageUrl) && !imageLoadError ? (
                    <img 
                      src={imagePreview || user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.error('Failed to load profile image:', user.profileImageUrl);
                        setImageLoadError(true);
                      }}
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary-600" />
                  )}
                </div>
                {isEditMode && (
                  <label 
                    htmlFor="profile-image" 
                    className="absolute -bottom-1 -right-1 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
                    title="Upload profile picture"
                  >
                    <Edit className="h-3 w-3" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-3 w-3 text-primary-600" />
                  <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'} text-xs`}>
                    {user.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                </div>
              </div>
            </div>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="btn-outline flex items-center gap-2 text-sm"
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
                    setProfileImage(null);
                    setImagePreview(null);
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    First Name
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.firstName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Last Name
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.lastName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Phone
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Role
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm capitalize">{user.role}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Member Since
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

            {/* Administrator Access Info */}
            {user.role === 'admin' && (
              <div className="card mt-6 bg-primary-50 border-primary-200">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-2">
                      Administrator Access
                    </h3>
                    <p className="text-primary-700">
                      You have full administrative privileges to manage users, missions, content, and all other aspects of the platform.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Account Status & Change Password */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${user.status === 'active' ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                <span className="text-gray-700">
                  Your account is <strong>{user.status === 'active' ? 'Active' : 'Inactive'}</strong>
                </span>
              </div>
            </div>

            {/* Change Password Section (Admin Only) */}
            {user.role === 'admin' && (
              <div className="card">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-gray-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-600 mt-1">Update your account password</p>
                    </div>
                  </div>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="btn-outline flex items-center gap-2 text-sm px-3 py-2"
                    >
                      <Edit className="h-4 w-4" />
                      Change
                    </button>
                  )}
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                        className="input w-full"
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        required
                        minLength={6}
                        className="input w-full"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        required
                        className="input w-full"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="btn-primary">
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-gray-600">
                    <p>Click "Change" to update your account password</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
