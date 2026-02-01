import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Trash2, ChevronUp, ChevronDown, Eye, Edit, Globe } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import RichTextDisplay from '@/components/RichTextDisplay';

export interface CarouselImage {
  imageId: string;
  url: string;
  sequence: number;
  active: boolean;
}

export interface FutureExplorersContent {
  row1Col1Html: string;
  carouselImages: CarouselImage[];
  row2Html: string;
}

type FutureExplorersSectionId = 'about' | 'images' | 'stories';

interface FutureExplorersEditorProps {
  /** When true, shows the page title and description (e.g. on dedicated admin page). */
  showTitle?: boolean;
  /** When true, use Settings-style card headers (Last modified, Published, Preview, Edit) like Homepage Hero. */
  useSettingsLayout?: boolean;
}

export default function FutureExplorersEditor({ showTitle = true, useSettingsLayout = false }: FutureExplorersEditorProps) {
  const [content, setContent] = useState<FutureExplorersContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [row1Html, setRow1Html] = useState('');
  const [row2Html, setRow2Html] = useState('');
  const [editingSection, setEditingSection] = useState<FutureExplorersSectionId | null>(null);
  const [previewSection, setPreviewSection] = useState<FutureExplorersSectionId | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (content) {
      setRow1Html(content.row1Col1Html ?? '');
      setRow2Html(content.row2Html ?? '');
    }
  }, [content]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/site-content/future-explorers');
      if (res.success && res.data) setContent(res.data as FutureExplorersContent);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRow1 = async () => {
    try {
      setSaving('row1');
      await api.put('/admin/site-content/future-explorers', { row1Col1Html: row1Html });
      toast.success('Row 1 content published');
      await fetchContent();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(null);
    }
  };

  const handleSaveRow2 = async () => {
    try {
      setSaving('row2');
      await api.put('/admin/site-content/future-explorers', { row2Html });
      toast.success('Row 2 content published');
      await fetchContent();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(null);
    }
  };

  const handleUploadCarousel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    let uploaded = 0;
    try {
      for (const file of files) {
        const res = await api.uploadFile<FutureExplorersContent>(
          '/admin/site-content/future-explorers/upload-carousel',
          file
        );
        if (res.success && res.data) {
          setContent(res.data);
          uploaded++;
        }
      }
      await fetchContent();
      if (uploaded === files.length) {
        toast.success(uploaded === 1 ? 'Image uploaded and published' : `${uploaded} images uploaded and published`);
      } else if (uploaded > 0) {
        toast.success(`${uploaded} of ${files.length} images uploaded`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
      await fetchContent();
    }
    e.target.value = '';
  };

  const handleToggleActive = async (imageId: string, active: boolean) => {
    try {
      const res = await api.put<FutureExplorersContent>(
        `/admin/site-content/future-explorers/carousel/${imageId}`,
        { active: !active }
      );
      if (res.success && res.data) setContent(res.data);
      toast.success('Updated');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Remove this image from the carousel?')) return;
    try {
      const res = await api.delete<FutureExplorersContent>(
        `/admin/site-content/future-explorers/carousel/${imageId}`
      );
      if (res.success && res.data) setContent(res.data);
      toast.success('Image removed');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const images = [...(content?.carouselImages ?? [])].sort((a, b) => a.sequence - b.sequence);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    [images[index], images[newIndex]] = [images[newIndex], images[index]];
    const orderedImageIds = images.map((img) => img.imageId);
    try {
      const res = await api.put<FutureExplorersContent>(
        '/admin/site-content/future-explorers/carousel-order',
        { orderedImageIds }
      );
      if (res.success && res.data) setContent(res.data);
      toast.success('Order updated');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const sortedImages = [...(content?.carouselImages ?? [])].sort((a, b) => a.sequence - b.sequence);
  const imageUrl = (url: string) => (url.startsWith('/') ? url : `/${url}`);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Future Explorers' Program</h2>
          <p className="text-gray-600 -mt-4 mb-4">
            Edit content and carousel. Changes publish immediately to the live site.
          </p>
        </>
      )}

      {/* About the Program */}
      <div className="card">
        {useSettingsLayout && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">About the Program</h2>
              <p className="text-sm text-gray-500">Last modified: —</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-success flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Published
              </span>
              {editingSection !== 'about' && (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewSection(previewSection === 'about' ? null : 'about')}
                    className="btn-outline text-sm py-1.5 px-3"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewSection === 'about' ? 'Hide' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingSection('about'); setPreviewSection(null); }}
                    className="btn-primary text-sm py-1.5 px-3"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {!useSettingsLayout && (
          <>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">About the Program</h3>
            <p className="text-sm text-gray-500 mb-4">Rich text shown in the left column on the Future Explorers page.</p>
          </>
        )}
        {editingSection === 'about' ? (
          <>
            <RichTextEditor value={row1Html} onChange={setRow1Html} height="200px" />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleSaveRow1}
                disabled={saving === 'row1'}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving === 'row1' ? 'Publishing...' : 'Publish'}
              </button>
              {useSettingsLayout && (
                <button type="button" onClick={() => setEditingSection(null)} className="btn-outline">Cancel</button>
              )}
            </div>
          </>
        ) : previewSection === 'about' ? (
          <div className="bg-gray-50 p-6 rounded-lg">
            <RichTextDisplay content={row1Html || '<p>No content yet.</p>'} />
          </div>
        ) : useSettingsLayout ? (
          <div className="text-gray-600 text-sm">
            <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: row1Html || '<p>No content yet.</p>' }} />
            <button
              type="button"
              onClick={() => setPreviewSection('about')}
              className="text-primary-600 hover:text-primary-700 mt-2"
            >
              Show more...
            </button>
          </div>
        ) : (
          <>
            <RichTextEditor value={row1Html} onChange={setRow1Html} height="200px" />
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSaveRow1}
                disabled={saving === 'row1'}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving === 'row1' ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Images */}
      <div className="card">
        {useSettingsLayout && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Images</h2>
              <p className="text-sm text-gray-500">Last modified: —</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-success flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Published
              </span>
              {editingSection !== 'images' && (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewSection(previewSection === 'images' ? null : 'images')}
                    className="btn-outline text-sm py-1.5 px-3"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewSection === 'images' ? 'Hide' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingSection('images'); setPreviewSection(null); }}
                    className="btn-primary text-sm py-1.5 px-3"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {!useSettingsLayout && (
          <>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Images</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload images and set order. Only <strong>active</strong> images appear in the carousel. Use arrows to change sequence.
            </p>
          </>
        )}
        {editingSection === 'images' ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadCarousel}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-outline inline-flex items-center gap-2 mb-4"
            >
              <Upload className="h-4 w-4" />
              Upload image(s)
            </button>
            {sortedImages.length === 0 ? (
              <p className="text-gray-500 py-4">No carousel images yet. Upload images above.</p>
            ) : (
              <ul className="space-y-3">
                {sortedImages.map((img, index) => (
                  <li
                    key={img.imageId}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-40">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveImage(index, 'down')} disabled={index === sortedImages.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-40">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <img src={imageUrl(img.url)} alt="" className="h-14 w-20 object-cover rounded border border-gray-200" />
                    <span className="text-sm text-gray-600">Sequence: {img.sequence + 1}</span>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={img.active} onChange={() => handleToggleActive(img.imageId, img.active)} />
                      <span className="text-sm">Active</span>
                    </label>
                    <button type="button" onClick={() => handleDeleteImage(img.imageId)} className="ml-auto text-red-600 hover:text-red-700 p-1" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {useSettingsLayout && (
              <div className="mt-4">
                <button type="button" onClick={() => setEditingSection(null)} className="btn-outline">Cancel</button>
              </div>
            )}
          </>
        ) : previewSection === 'images' ? (
          <div className="bg-gray-50 p-6 rounded-lg">
            {sortedImages.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No carousel images yet.</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sortedImages.map((img) => (
                  <li key={img.imageId}>
                    <img src={imageUrl(img.url)} alt="" className="w-full aspect-video object-cover rounded border border-gray-200" />
                    <p className="text-xs text-gray-500 mt-1">Seq. {img.sequence + 1} · {img.active ? 'Active' : 'Inactive'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : useSettingsLayout ? (
          <div className="text-gray-500 italic text-sm">Click &quot;Edit&quot; to manage carousel images. Only active images appear on the live page.</div>
        ) : (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadCarousel} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-outline inline-flex items-center gap-2 mb-4">
              <Upload className="h-4 w-4" /> Upload image(s)
            </button>
            {sortedImages.length === 0 ? (
              <p className="text-gray-500 py-4">No carousel images yet. Upload images above.</p>
            ) : (
              <ul className="space-y-3">
                {sortedImages.map((img, index) => (
                  <li key={img.imageId} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"><ChevronUp className="h-4 w-4" /></button>
                      <button type="button" onClick={() => moveImage(index, 'down')} disabled={index === sortedImages.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"><ChevronDown className="h-4 w-4" /></button>
                    </div>
                    <img src={imageUrl(img.url)} alt="" className="h-14 w-20 object-cover rounded border border-gray-200" />
                    <span className="text-sm text-gray-600">Sequence: {img.sequence + 1}</span>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={img.active} onChange={() => handleToggleActive(img.imageId, img.active)} />
                      <span className="text-sm">Active</span>
                    </label>
                    <button type="button" onClick={() => handleDeleteImage(img.imageId)} className="ml-auto text-red-600 hover:text-red-700 p-1" title="Remove"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Stories */}
      <div className="card">
        {useSettingsLayout && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Stories</h2>
              <p className="text-sm text-gray-500">Last modified: —</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-success flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Published
              </span>
              {editingSection !== 'stories' && (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewSection(previewSection === 'stories' ? null : 'stories')}
                    className="btn-outline text-sm py-1.5 px-3"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewSection === 'stories' ? 'Hide' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingSection('stories'); setPreviewSection(null); }}
                    className="btn-primary text-sm py-1.5 px-3"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {!useSettingsLayout && (
          <>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Stories</h3>
            <p className="text-sm text-gray-500 mb-4">
              Rich text (images, text, or combination) shown in the full-width section below.
            </p>
          </>
        )}
        {editingSection === 'stories' ? (
          <>
            <RichTextEditor value={row2Html} onChange={setRow2Html} height="240px" />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleSaveRow2}
                disabled={saving === 'row2'}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving === 'row2' ? 'Publishing...' : 'Publish'}
              </button>
              {useSettingsLayout && (
                <button type="button" onClick={() => setEditingSection(null)} className="btn-outline">Cancel</button>
              )}
            </div>
          </>
        ) : previewSection === 'stories' ? (
          <div className="bg-gray-50 p-6 rounded-lg">
            <RichTextDisplay content={row2Html || '<p>No content yet.</p>'} />
          </div>
        ) : useSettingsLayout ? (
          <div className="text-gray-600 text-sm">
            <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: row2Html || '<p>No content yet.</p>' }} />
            <button
              type="button"
              onClick={() => setPreviewSection('stories')}
              className="text-primary-600 hover:text-primary-700 mt-2"
            >
              Show more...
            </button>
          </div>
        ) : (
          <>
            <RichTextEditor value={row2Html} onChange={setRow2Html} height="240px" />
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSaveRow2}
                disabled={saving === 'row2'}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving === 'row2' ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
