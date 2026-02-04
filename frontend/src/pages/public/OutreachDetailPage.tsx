import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Package, Image as ImageIcon, Rocket, Download } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Outreach {
  outreachId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  imageUrl?: string;
}

interface PublicParticipant {
  userId: string;
  firstName: string;
  lastName: string;
  role?: string;
  profileImageUrl?: string;
}

interface OutreachArtifact {
  artifactId: string;
  outreachId: string;
  description: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: string;
}

interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  title: string;
  description?: string;
  outreachId?: string;
  uploadedAt: string;
  viewCount: number;
}

interface OutreachDetailData {
  outreach: Outreach;
  participants: PublicParticipant[];
  artifacts: OutreachArtifact[];
  gallery: GalleryImage[];
}

function isImage(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(u) || u.startsWith('data:image');
}

export default function OutreachDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<OutreachDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchOutreachDetail();
    }
  }, [slug]);

  const fetchOutreachDetail = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/public/outreach/${slug}`);
      if (res.success && res.data) {
        setData(res.data as OutreachDetailData);
      } else {
        setData(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };
  /** Gallery/media paths from API are relative to uploads (e.g. outreach-galleries/...). */
  const galleryMediaUrl = (url: string) => (url?.startsWith('http') ? url : url?.startsWith('/') ? url : `/uploads/${url || ''}`);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  if (!data?.outreach) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="card text-center py-12">
            <Rocket className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Outreach not found</h3>
            <p className="text-gray-600 mb-4">The outreach event you're looking for doesn't exist or is not available.</p>
            <Link to="/future-explorers" className="btn-primary">
              Back to Future Explorers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { outreach, participants, artifacts, gallery } = data;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          to="/future-explorers"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Future Explorers
        </Link>

        {/* Hero */}
        <div className="relative h-96 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl overflow-hidden mb-8">
          {outreach.imageUrl ? (
            outreach.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={imageUrl(outreach.imageUrl)}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={imageUrl(outreach.imageUrl)}
                alt={outreach.title}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <Rocket className="h-32 w-32 text-white opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">{outreach.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{outreach.description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card flex flex-col">
                <div className="flex items-start gap-3 flex-1">
                  <Calendar className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Event Dates</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Starts:</strong>{' '}
                      {new Date(outreach.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Ends:</strong>{' '}
                      {new Date(outreach.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              {outreach.location ? (
                <div className="card flex flex-col">
                  <div className="flex items-start gap-3 flex-1">
                    <MapPin className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                      <p className="text-gray-700">{outreach.location}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Coordinators */}
            {participants.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary-600" />
                  Coordinators
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {participants.map((p) => (
                    <div
                      key={p.userId}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      {p.profileImageUrl ? (
                        <img
                          src={imageUrl(p.profileImageUrl)}
                          alt={`${p.firstName} ${p.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                          {p.firstName?.[0]}
                          {p.lastName?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {p.firstName} {p.lastName}
                        </p>
                        {p.role && <p className="text-sm text-gray-600">{p.role}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artifacts */}
            {artifacts.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary-600" />
                  Artifacts
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artifacts.map((a, index) => (
                        <tr key={a.artifactId} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">{index + 1}</td>
                          <td className="py-4 px-4">{a.description}</td>
                          <td className="py-4 px-4">
                            <a
                              href={a.filePath.startsWith('http') ? a.filePath : `/uploads/${a.filePath}`}
                              download
                              className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              {a.originalFileName}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="h-6 w-6 text-primary-600" />
                  Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div key={item.galleryId} className="rounded-lg overflow-hidden bg-gray-100 aspect-square">
                      {isImage(item.imageUrl) ? (
                        <img
                          src={galleryMediaUrl(item.imageUrl)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={galleryMediaUrl(item.imageUrl)}
                          className="w-full h-full object-cover"
                          controls
                          muted
                          playsInline
                        />
                      )}
                      {item.title && (
                        <p className="p-2 text-sm font-medium text-gray-700 truncate" title={item.title}>
                          {item.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary-600" />
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {Math.ceil(
                      (new Date(outreach.endDate).getTime() - new Date(outreach.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </span>
                </div>
                {participants.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary-600" />
                    <span className="text-gray-600">Coordinators:</span>
                    <span className="font-medium text-gray-900">{participants.length}</span>
                  </div>
                )}
                {artifacts.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary-600" />
                    <span className="text-gray-600">Artifacts:</span>
                    <span className="font-medium text-gray-900">{artifacts.length}</span>
                  </div>
                )}
                {gallery.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary-600" />
                    <span className="text-gray-600">Gallery:</span>
                    <span className="font-medium text-gray-900">{gallery.length} items</span>
                  </div>
                )}
              </div>
            </div>
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Have Questions?</h3>
              <p className="text-sm text-gray-600 mb-4">Contact our team about this outreach event.</p>
              <Link to="/contact?subject=outreach" className="btn-outline w-full justify-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
