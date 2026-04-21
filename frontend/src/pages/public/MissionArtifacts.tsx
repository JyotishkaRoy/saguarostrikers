import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, ArrowLeft, Rocket } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Artifact {
  artifactId: string;
  missionId: string;
  description: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

interface Mission {
  missionId: string;
  title: string;
  slug: string;
}

export default function MissionArtifacts() {
  const { missionSlug } = useParams<{ missionSlug: string }>();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (missionSlug) {
      fetchMissionAndArtifacts();
    }
  }, [missionSlug]);

  const fetchMissionAndArtifacts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch mission details
      const missionResponse = await api.get<Mission>(`/public/missions/slug/${missionSlug}`);
      if (missionResponse.success && missionResponse.data) {
        setMission(missionResponse.data);
      }

      // Fetch published artifacts
      const artifactsResponse = await api.get<Artifact[]>(`/public/missions/${missionSlug}/artifacts`);
      if (artifactsResponse.success && artifactsResponse.data) {
        setArtifacts(artifactsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching mission artifacts:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Mission Not Found</h1>
            <Link to="/missions" className="text-primary-600 hover:underline">
              Back to Missions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link
            to={`/missions/${missionSlug}`}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mission
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {mission.title} <span className="text-gray-400 mx-2">|</span> Mission Artifacts
            </h1>
          </div>
        </div>

        {/* Artifacts Table */}
        {artifacts.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No artifacts available for this mission</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sl.No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Artifact Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Artifact File Name</th>
                </tr>
              </thead>
              <tbody>
                {artifacts.map((artifact, index) => (
                  <tr key={artifact.artifactId} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{index + 1}</td>
                    <td className="py-4 px-4">{artifact.description}</td>
                    <td className="py-4 px-4">
                      <a
                        href={`/uploads/${artifact.filePath}`}
                        download
                        className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {artifact.originalFileName}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
