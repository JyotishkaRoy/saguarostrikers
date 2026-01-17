import { useState, useEffect } from 'react';
import { Save, Eye, Edit, Globe, Plus, X as XIcon, Image as ImageIcon } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import RichTextDisplay from '@/components/RichTextDisplay';

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

  const handleSave = async (contentId: string) => {
    try {
      await api.put(`/admin/site-content/${contentId}`, {
        title: editTitle,
        content: editContent
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

  const sections = [
    { key: 'homepage-hero', label: 'Homepage Hero', type: 'hero' },
    { key: 'homepage-about', label: 'About Us', type: 'richtext' },
    { key: 'homepage-mission', label: 'Mission', type: 'richtext' },
    { key: 'homepage-vision', label: 'Vision', type: 'richtext' },
  ];

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Content Management</h1>
        <p className="text-gray-600">Edit and manage website content with rich text formatting</p>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const content = contents.find(c => c.section === section.key) || {
            contentId: section.key,
            section: section.key,
            title: section.label,
            content: '<p>Content coming soon...</p>',
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
                section.type === 'hero' ? (
                  <HeroEditor
                    content={editContent}
                    onChange={setEditContent}
                    onSave={() => handleSave(content.contentId)}
                    onCancel={() => setEditingId(null)}
                  />
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
                        height="400px"
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
                section.type === 'hero' ? (
                  <HeroPreview content={content.content} />
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">{content.title}</h3>
                    <RichTextDisplay content={content.content} />
                  </div>
                )
              ) : (
                <div className="text-gray-600 text-sm">
                  {section.type === 'hero' ? (
                    <div className="text-gray-500 italic">Click "Preview" to see hero section content</div>
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
        })}
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
          <div className="flex gap-2">
            <input
              type="text"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              className="input flex-1"
              placeholder="/images/banner/Banner 1.png"
            />
            <button onClick={handleAddImage} className="btn-outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
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
