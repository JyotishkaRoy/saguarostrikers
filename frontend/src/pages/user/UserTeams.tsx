import { Users } from 'lucide-react';

export default function UserTeams() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-10 w-10 text-primary-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Teams</h1>
        </div>
        <p className="text-lg text-gray-600">View your team members and assignments</p>
      </div>
      <div className="card">
        <p>Content for UserTeams...</p>
      </div>
    </div>
  );
}
