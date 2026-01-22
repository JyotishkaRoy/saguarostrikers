import { Trophy } from 'lucide-react';

export default function UserMissions() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-10 w-10 text-primary-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Missions</h1>
        </div>
        <p className="text-lg text-gray-600">View and manage your missions</p>
      </div>
      <div className="card">
        <p>Content for UserMissions...</p>
      </div>
    </div>
  );
}
