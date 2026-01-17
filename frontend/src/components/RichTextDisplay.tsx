interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export default function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        lineHeight: '1.75',
        color: '#1f2937'
      }}
    />
  );
}
