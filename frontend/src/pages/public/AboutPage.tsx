import { Info } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Info className="h-10 w-10 text-primary-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">About Us</h1>
        </div>
        <p className="text-lg text-gray-600">About Saguaro Strikers...</p>
      </div>
    </div>
  );
}
