import { useState, useEffect, useRef } from 'react';
import { Save, Eye, Edit, Globe, Plus, X as XIcon, Image as ImageIcon } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
const FEATURED_VIDEO_UPLOAD_PREFIX = '/uploads/featured-videos/';
import { toYouTubeEmbedUrl, isEmbedVideoUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import RichTextDisplay from '@/components/RichTextDisplay';
import FutureExplorersEditor from '@/components/FutureExplorersEditor';
import axios from 'axios';

interface SiteContent {
  contentId: string;
  section: string;
  title: string;
  content: string;
  isPublished: boolean;
  lastModified: string;
}

export default function AdminSiteContent() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteContent();
  }, []);

  const fetchSiteContent = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/site-content');
      if (response.success && response.data && Array.isArray(response.data)) {
        setContents(response.data as SiteContent[]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (content: SiteContent) => {
    setEditingId(content.contentId);
    setEditTitle(content.title);
    setEditContent(content.content);
    setPreviewMode(null);
  };

  const handleSave = async (contentId: string, contentOverride?: string) => {
    try {
      const contentToSend = contentOverride !== undefined ? contentOverride : editContent;
      await api.put(`/admin/site-content/${contentId}`, {
        title: editTitle,
        content: contentToSend
      });
      toast.success('Content updated successfully');
      setEditingId(null);
      fetchSiteContent();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleTogglePublish = async (contentId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/site-content/${contentId}`, {
        isPublished: !currentStatus
      });
      toast.success(`Content ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchSiteContent();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  type TabId = 'homepage-hero' | 'mission-director' | 'about-us' | 'agreements-consent' | 'future-explorers';
  const [activeTab, setActiveTab] = useState<TabId>('homepage-hero');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'homepage-hero', label: 'Homepage Hero' },
    { id: 'about-us', label: 'Homepage' },
    { id: 'mission-director', label: 'Mission Director Statement' },
    { id: 'agreements-consent', label: 'Agreements & Consent' },
    { id: 'future-explorers', label: 'Outreach' },
  ];

  const sectionsByTab: Record<TabId, { key: string; label: string; type: 'hero' | 'commander' | 'richtext' | 'featured-videos' | 'plain' }[]> = {
    'homepage-hero': [
      { key: 'homepage-hero', label: 'Homepage Hero', type: 'hero' },
    ],
    'mission-director': [
      { key: 'mission-commander', label: 'Mission Director Statement', type: 'commander' },
      { key: 'homepage-mission', label: 'Mission', type: 'richtext' },
      { key: 'homepage-vision', label: 'Vision', type: 'richtext' },
    ],
    'about-us': [
      { key: 'homepage-about', label: 'About Us', type: 'richtext' },
      { key: 'featured-videos', label: 'Featured Videos', type: 'featured-videos' },
    ],
    'agreements-consent': [
      { key: 'join-mission-agreement-financial', label: 'Financial Obligations Agreement', type: 'plain' },
      { key: 'join-mission-agreement-photograph', label: 'Photograph & Video Consent', type: 'plain' },
      { key: 'join-mission-agreement-liability', label: 'Liability Release', type: 'plain' },
    ],
  };

  const sections = activeTab === 'future-explorers' ? [] : sectionsByTab[activeTab];

  if (isLoading && activeTab !== 'future-explorers') {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Edit and manage website content</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content: sections for active tab */}
      <div className="space-y-6">
        {activeTab === 'future-explorers' ? (
          <FutureExplorersEditor showTitle={false} useSettingsLayout />
        ) : (
        sections.map((section) => {
          const content = contents.find(c => c.section === section.key) || {
            contentId: section.key,
            section: section.key,
            title: section.label,
            content: section.key === 'featured-videos' ? JSON.stringify({ videos: [] }, null, 2) : section.type === 'plain' ? '' : '<p>Content coming soon...</p>',
            isPublished: false,
            lastModified: new Date().toISOString()
          };

          const isEditing = editingId === content.contentId;
          const isPreview = previewMode === content.contentId;

          return (
            <div key={section.key} className="card">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{section.label}</h2>
                  <p className="text-sm text-gray-500">
                    Last modified: {new Date(content.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {content.isPublished ? (
                    <span className="badge-success flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Published
                    </span>
                  ) : (
                    <span className="badge-warning">Draft</span>
                  )}
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => setPreviewMode(isPreview ? null : content.contentId)}
                        className="btn-outline text-sm py-1.5 px-3"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {isPreview ? 'Hide' : 'Preview'}
                      </button>
                      <button
                        onClick={() => handleEdit(content)}
                        className="btn-primary text-sm py-1.5 px-3"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                section.type === 'featured-videos' ? (
                  <FeaturedVideosEditor
                    content={editContent}
                    onChange={setEditContent}
                    onSave={(serialized) => handleSave(content.contentId, serialized)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : section.type === 'hero' ? (
                  <HeroEditor
                    content={editContent}
                    onChange={setEditContent}
                    onSave={() => handleSave(content.contentId)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : section.type === 'commander' ? (
                  <MissionCommanderEditor
                    content={editContent}
                    onChange={setEditContent}
                    onSave={() => handleSave(content.contentId)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : section.type === 'plain' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text (shown on Join Mission page)
                      </label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                        className="input w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleSave(content.contentId)} className="btn-primary">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-outline">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <RichTextEditor
                        value={editContent}
                        onChange={setEditContent}
                        height="280px"
                        placeholder="Enter your content here..."
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => handleSave(content.contentId)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => handleTogglePublish(content.contentId, content.isPublished)}
                        className={content.isPublished ? "btn-warning" : "btn-success"}
                      >
                        {content.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )
              ) : isPreview ? (
                section.type === 'featured-videos' ? (
                  <FeaturedVideosPreview content={content.content} />
                ) : section.type === 'hero' ? (
                  <HeroPreview content={content.content} />
                ) : section.type === 'commander' ? (
                  <MissionCommanderPreview content={content.content} />
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">{content.title}</h3>
                    <RichTextDisplay content={content.content} />
                  </div>
                )
              ) : (
                <div className="text-gray-600 text-sm">
                  {section.type === 'featured-videos' ? (
                    <div className="text-gray-500 italic">Click "Edit" to manage up to 3 featured videos (link or upload). Shown on homepage.</div>
                  ) : section.type === 'hero' || section.type === 'commander' ? (
                    <div className="text-gray-500 italic">Click "Preview" to see {section.type === 'hero' ? 'hero' : 'mission director'} content</div>
                  ) : (
                    <>
                      <div 
                        className="line-clamp-3" 
                        dangerouslySetInnerHTML={{ __html: content.content }}
                      />
                      <button 
                        onClick={() => setPreviewMode(content.contentId)}
                        className="text-primary-600 hover:text-primary-700 mt-2"
                      >
                        Show more...
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}

// Hero Editor Component
interface HeroEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function HeroEditor({ content, onChange, onSave, onCancel }: HeroEditorProps) {
  const [heroData, setHeroData] = useState(() => {
    try {
      return JSON.parse(content);
    } catch {
      return {
        headline: '',
        subheadline: '',
        images: [],
        ctas: []
      };
    }
  });

  const [newImage, setNewImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newCTA, setNewCTA] = useState<{ text: string; link: string; style: 'primary' | 'secondary' }>({ 
    text: '', 
    link: '', 
    style: 'primary' 
  });

  // Update parent when heroData changes
  useEffect(() => {
    onChange(JSON.stringify(heroData, null, 2));
  }, [heroData, onChange]);

  const handleAddImage = () => {
    if (newImage.trim()) {
      setHeroData((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setHeroData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAddCTA = () => {
    if (newCTA.text.trim() && newCTA.link.trim()) {
      setHeroData((prev: any) => ({
        ...prev,
        ctas: [...(prev.ctas || []), { ...newCTA }]
      }));
      setNewCTA({ text: '', link: '', style: 'primary' });
    }
  };

  const handleRemoveCTA = (index: number) => {
    setHeroData((prev: any) => ({
      ...prev,
      ctas: prev.ctas.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('banner', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = sessionStorage.getItem('token');

      // Use axios directly to properly handle FormData
      const response = await axios.post(
        `${API_URL}/admin/site-content/upload-banner`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type - let browser set it with boundary
          },
        }
      );

      if (response.data.success && response.data.data) {
        const imageUrl = response.data.data.url;
        setHeroData((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
        toast.success('Banner image uploaded successfully');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Headline
        </label>
        <input
          type="text"
          value={heroData.headline || ''}
          onChange={(e) => setHeroData({ ...heroData, headline: e.target.value })}
          className="input w-full"
          placeholder="Welcome to Saguaro Strikers Rocketry"
        />
      </div>

      {/* Subheadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subheadline
        </label>
        <textarea
          value={heroData.subheadline || ''}
          onChange={(e) => setHeroData({ ...heroData, subheadline: e.target.value })}
          className="input w-full"
          rows={3}
          placeholder="Join us in pushing the boundaries of amateur rocketry"
        />
      </div>

      {/* Banner Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Images
        </label>
        <div className="space-y-2">
          {(heroData.images || []).map((img: string, index: number) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span className="flex-1 text-sm text-gray-700 truncate">{img}</span>
              <button
                onClick={() => handleRemoveImage(index)}
                className="text-danger-600 hover:text-danger-800"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {/* Upload Banner Image */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex flex-col items-center justify-center gap-2">
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600 text-center">
                Upload a banner image (max 5MB)
              </p>
              <label
                htmlFor="banner-upload"
                className={`btn-primary cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Or add by URL */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Or add by URL</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              className="input flex-1"
              placeholder="/images/banners/Banner 1.png"
            />
            <button onClick={handleAddImage} className="btn-outline">
              <Plus className="h-4 w-4 mr-1" />
              Add URL
            </button>
          </div>
        </div>
      </div>

      {/* Call-to-Action Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Call-to-Action Buttons
        </label>
        <div className="space-y-2 mb-3">
          {(heroData.ctas || []).map((cta: any, index: number) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded">
              <div className="flex-1">
                <div className="font-medium text-sm">{cta.text}</div>
                <div className="text-xs text-gray-500">{cta.link}</div>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                  cta.style === 'primary' ? 'bg-primary-100 text-primary-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {cta.style}
                </span>
              </div>
              <button
                onClick={() => handleRemoveCTA(index)}
                className="text-danger-600 hover:text-danger-800"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="border border-gray-200 rounded-lg p-3 space-y-2">
          <input
            type="text"
            value={newCTA.text}
            onChange={(e) => setNewCTA({ ...newCTA, text: e.target.value })}
            className="input w-full"
            placeholder="Button Text (e.g., Join Our Team)"
          />
          <input
            type="text"
            value={newCTA.link}
            onChange={(e) => setNewCTA({ ...newCTA, link: e.target.value })}
            className="input w-full"
            placeholder="Link (e.g., /join-mission)"
          />
          <div className="flex gap-2">
            <select
              value={newCTA.style}
              onChange={(e) => setNewCTA({ ...newCTA, style: e.target.value as 'primary' | 'secondary' })}
              className="input flex-1"
            >
              <option value="primary">Primary Style</option>
              <option value="secondary">Secondary Style</option>
            </select>
            <button onClick={handleAddCTA} className="btn-outline">
              <Plus className="h-4 w-4 mr-1" />
              Add CTA
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button onClick={onSave} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Hero Section
        </button>
        <button onClick={onCancel} className="btn-outline">
          Cancel
        </button>
      </div>
    </div>
  );
}

// Hero Preview Component
interface HeroPreviewProps {
  content: string;
}

function HeroPreview({ content }: HeroPreviewProps) {
  const heroData = (() => {
    try {
      return JSON.parse(content);
    } catch {
      return {
        headline: '',
        subheadline: '',
        images: [],
        ctas: []
      };
    }
  })();

  return (
    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Headline</h3>
        <p className="text-2xl font-bold text-gray-900">{heroData.headline || 'No headline set'}</p>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Subheadline</h3>
        <p className="text-lg text-gray-700">{heroData.subheadline || 'No subheadline set'}</p>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Banner Images ({heroData.images?.length || 0})
        </h3>
        {heroData.images && heroData.images.length > 0 ? (
          <div className="space-y-1">
            {heroData.images.map((img: string, index: number) => (
              <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <ImageIcon className="h-3 w-3" />
                {img}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No banner images</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Call-to-Action Buttons ({heroData.ctas?.length || 0})
        </h3>
        {heroData.ctas && heroData.ctas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {heroData.ctas.map((cta: any, index: number) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg font-medium ${
                  cta.style === 'primary'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border-2 border-primary-600 text-primary-600'
                }`}
              >
                {cta.text}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No CTA buttons</p>
        )}
      </div>
    </div>
  );
}

// Mission Commander Editor Component
interface MissionCommanderEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function MissionCommanderEditor({ content, onChange, onSave, onCancel }: MissionCommanderEditorProps) {
  const [commanderData, setCommanderData] = useState(() => {
    try {
      return JSON.parse(content);
    } catch {
      return {
        message: '',
        name: 'Mission Director',
        title: 'Team Leader',
        image: ''
      };
    }
  });

  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState<Array<{ userId: string; firstName: string; lastName: string; email: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await api.get<Array<{ userId: string; firstName: string; lastName: string; email: string }>>('/admin/users');
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users list');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Update parent when commanderData changes
  useEffect(() => {
    onChange(JSON.stringify(commanderData, null, 2));
  }, [commanderData, onChange]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const formData = new FormData();
      formData.append('missionDirector', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = sessionStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/admin/site-content/upload-mission-director`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const imageUrl = response.data.data.url;
        setCommanderData((prev: any) => ({
          ...prev,
          image: imageUrl
        }));
        toast.success('Director image uploaded successfully');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Director Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Director's Message
        </label>
        <textarea
          value={commanderData.message || ''}
          onChange={(e) => setCommanderData({ ...commanderData, message: e.target.value })}
          className="input w-full"
          rows={6}
          placeholder="To the dedicated members of [Organization], your unwavering passion and dedication..."
        />
        <p className="text-xs text-gray-500 mt-1">
          This message will be displayed with quotation marks on the Mission Statement page
        </p>
      </div>

      {/* Director Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Director's Name
        </label>
        {loadingUsers ? (
          <div className="input w-full flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span className="text-sm text-gray-500">Loading users...</span>
          </div>
        ) : (
          <select
            value={commanderData.name || ''}
            onChange={(e) => {
              setCommanderData({ 
                ...commanderData, 
                name: e.target.value,
              });
            }}
            className="input w-full"
          >
            <option value="">Select a user...</option>
            {users.map((user) => (
              <option key={user.userId} value={`${user.firstName} ${user.lastName}`}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Select from registered users or type a custom name
        </p>
      </div>

      {/* Director Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Director's Title
        </label>
        <input
          type="text"
          value={commanderData.title || ''}
          onChange={(e) => setCommanderData({ ...commanderData, title: e.target.value })}
          className="input w-full"
          placeholder="Team Leader"
        />
      </div>

      {/* Director Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Director's Profile Image
        </label>
        
        {commanderData.image && (
          <div className="mb-4">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary-500 mx-auto">
              <img
                src={commanderData.image}
                alt="Director"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600 text-center">
              Upload director's profile image (max 5MB)
            </p>
            <label
              htmlFor="director-upload"
              className={`btn-primary cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="h-4 w-4 mr-1" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </label>
            <input
              id="director-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
        </div>

        {commanderData.image && (
          <div className="mt-2">
            <button
              onClick={() => setCommanderData({ ...commanderData, image: '' })}
              className="text-sm text-danger-600 hover:text-danger-800"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button onClick={onSave} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Mission Director Content
        </button>
        <button onClick={onCancel} className="btn-outline">
          Cancel
        </button>
      </div>
    </div>
  );
}

// Mission Commander Preview Component
interface MissionCommanderPreviewProps {
  content: string;
}

function MissionCommanderPreview({ content }: MissionCommanderPreviewProps) {
  const commanderData = (() => {
    try {
      return JSON.parse(content);
    } catch {
      return {
        message: '',
        name: 'Mission Director',
        title: 'Team Leader',
        image: ''
      };
    }
  })();

  return (
    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Director's Message</h3>
        <p className="text-gray-700 italic">"{commanderData.message || 'No message set'}"</p>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Director Details</h3>
        <p className="text-lg font-bold text-gray-900">{commanderData.name || 'No name set'}</p>
        <p className="text-sm text-primary-600">{commanderData.title || 'No title set'}</p>
      </div>

      {commanderData.image && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Profile Image</h3>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500">
            <img
              src={commanderData.image}
              alt="Director"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Featured Videos Editor (max 3; link or upload)
interface FeaturedVideosEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: (content: string) => void;
  onCancel: () => void;
}

function FeaturedVideosEditor({ content, onChange, onSave, onCancel }: FeaturedVideosEditorProps) {
  const [videos, setVideos] = useState<Array<{ id?: string; title: string; url: string; thumbnail?: string }>>(() => {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.videos) ? parsed.videos.slice(0, 3) : [];
    } catch {
      return [];
    }
  });
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const previewUrlsRef = useRef<Record<number, string>>({});

  useEffect(() => {
    onChange(JSON.stringify({ videos }, null, 2));
  }, [videos, onChange]);

  useEffect(() => {
    Object.values(previewUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
    const next: Record<number, string> = {};
    Object.entries(pendingFiles).forEach(([key, file]) => {
      next[Number(key)] = URL.createObjectURL(file);
    });
    previewUrlsRef.current = next;
    setPreviewUrls(next);
    return () => {
      Object.values(previewUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
      previewUrlsRef.current = {};
    };
  }, [pendingFiles]);

  const setVideo = (index: number, updates: Partial<{ title: string; url: string; thumbnail?: string }>) => {
    setVideos(prev => {
      const next = [...prev];
      next[index] = { title: '', url: '', ...(next[index] || {}), ...updates };
      return next;
    });
  };

  const addSlot = () => {
    if (videos.length >= 3) return;
    setVideos(prev => [...prev, { title: '', url: '' }]);
  };

  const removeSlot = async (index: number) => {
    const urlToDelete = videos[index]?.url;
    if (urlToDelete?.startsWith(FEATURED_VIDEO_UPLOAD_PREFIX)) {
      try {
        await api.deleteWithBody('/admin/site-content/featured-video', { url: urlToDelete });
        toast.success('Video removed from server');
      } catch (err) {
        toast.error(getErrorMessage(err));
        return;
      }
    }
    setVideos(prev => prev.filter((_, i) => i !== index));
    setPendingFiles(prev => {
      const rekeyed: Record<number, File> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const i = Number(k);
        if (i === index) return;
        rekeyed[i > index ? i - 1 : i] = v;
      });
      return rekeyed;
    });
  };

  const handleFileSelect = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    setPendingFiles(prev => ({ ...prev, [index]: file }));
    setVideo(index, { title: videos[index]?.title || file.name.replace(/\.[^.]+$/, '') });
    event.target.value = '';
  };

  const clearPendingFile = (index: number) => {
    setPendingFiles(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleSave = async () => {
    const indicesToUpload = Object.keys(pendingFiles).map(Number).sort((a, b) => a - b);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const token = sessionStorage.getItem('token');
    setSaving(true);
    try {
      let updatedVideos = [...videos];
      for (const i of indicesToUpload) {
        const file = pendingFiles[i];
        if (!file) continue;
        const formData = new FormData();
        formData.append('video', file);
        const response = await axios.post(
          `${API_URL}/admin/site-content/upload-featured-video`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.success && response.data?.data?.url) {
          updatedVideos[i] = {
            ...updatedVideos[i],
            url: response.data.data.url,
            title: updatedVideos[i].title || response.data.data.originalName?.replace(/\.[^.]+$/, '') || file.name
          };
        }
      }
      const newUrls = new Set(updatedVideos.map(v => v.url).filter(Boolean));
      let previousVideos: Array<{ url?: string }> = [];
      try {
        const parsed = JSON.parse(content);
        previousVideos = Array.isArray(parsed.videos) ? parsed.videos : [];
      } catch {
        /* ignore */
      }
      for (const v of previousVideos) {
        const u = v.url?.trim();
        if (u?.startsWith(FEATURED_VIDEO_UPLOAD_PREFIX) && !newUrls.has(u)) {
          try {
            await api.deleteWithBody('/admin/site-content/featured-video', { url: u });
          } catch {
            /* best-effort delete */
          }
        }
      }
      setVideos(updatedVideos);
      setPendingFiles({});
      onSave(JSON.stringify({ videos: updatedVideos }, null, 2));
      toast.success('Featured videos saved.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Up to 3 videos shown on the homepage. Use a link (e.g. YouTube embed URL) or upload a video file.</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Video {i + 1}</span>
            {i < videos.length ? (
              <button type="button" onClick={() => removeSlot(i)} className="text-sm text-danger-600 hover:text-danger-800">Remove</button>
            ) : (
              <button type="button" onClick={addSlot} className="text-sm text-primary-600 hover:text-primary-800">Add</button>
            )}
          </div>
          {i < videos.length && (
            <>
              {pendingFiles[i] ? (
                <div className="rounded-lg overflow-hidden bg-black aspect-video mb-3 relative">
                  <video
                    src={previewUrls[i] || ''}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                    muted
                  />
                  <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1.5 px-2">
                    Selected: {pendingFiles[i].name} — not saved yet. Click &quot;Save Featured Videos&quot; to upload.
                  </p>
                  <button
                    type="button"
                    onClick={() => clearPendingFile(i)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded p-1.5 text-gray-700"
                    title="Remove selected file"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : videos[i].url ? (
                <div className="rounded-lg overflow-hidden bg-black aspect-video mb-3">
                  {isEmbedVideoUrl(videos[i].url) ? (
                    <iframe
                      src={toYouTubeEmbedUrl(videos[i].url)}
                      title={videos[i].title || `Video ${i + 1}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videos[i].url}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      muted
                    />
                  )}
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={videos[i].title}
                  onChange={(e) => setVideo(i, { title: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Welcome to Saguaro Strikers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (embed link or uploaded file URL)</label>
                <input
                  type="text"
                  value={videos[i].url}
                  onChange={(e) => setVideo(i, { url: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. https://www.youtube.com/embed/... or /uploads/featured-videos/..."
                  disabled={!!pendingFiles[i]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or upload a video file</label>
                <label className="inline-flex items-center gap-2 btn-outline cursor-pointer">
                  <Plus className="h-4 w-4" />
                  {pendingFiles[i] ? 'Change video' : 'Choose video'}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(i, e)}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      ))}
      {videos.length < 3 && (
        <button type="button" onClick={addSlot} className="btn-outline flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add video slot
        </button>
      )}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving & uploading...' : 'Save Featured Videos'}
        </button>
        <button onClick={onCancel} className="btn-outline" disabled={saving}>Cancel</button>
      </div>
      {Object.keys(pendingFiles).length > 0 && (
        <p className="text-sm text-amber-700 mt-2">
          You have {Object.keys(pendingFiles).length} video(s) selected but not yet saved. Click &quot;Save Featured Videos&quot; to upload them to the server.
        </p>
      )}
    </div>
  );
}

function FeaturedVideosPreview({ content }: { content: string }) {
  const videos = (() => {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.videos) ? parsed.videos : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Featured Videos ({videos.length})</h3>
      {videos.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No videos configured.</p>
      ) : (
        <ul className="space-y-2">
          {videos.map((v: { title?: string; url?: string }, i: number) => (
            <li key={i} className="text-sm">
              <span className="font-medium">{v.title || 'Untitled'}</span>
              {v.url && <span className="text-gray-500 ml-2 truncate block">{v.url}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
