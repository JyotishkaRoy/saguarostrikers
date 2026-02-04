interface AdminOutreachPlaceholderProps {
  title: string;
}

export default function AdminOutreachPlaceholder({ title }: AdminOutreachPlaceholderProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">This section can be implemented as needed.</p>
    </div>
  );
}
