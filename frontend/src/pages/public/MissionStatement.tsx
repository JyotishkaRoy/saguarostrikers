import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { HomepageContent } from '@/types';

export default function MissionStatement() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageFontSize, setMessageFontSize] = useState('text-xl md:text-2xl');

  useEffect(() => {
    fetchContent();
  }, []);

  // Adjust font size based on message length
  useEffect(() => {
    if (content?.missionCommanderMessage) {
      const messageLength = content.missionCommanderMessage.length;
      
      // Adjust font size based on character count
      if (messageLength < 150) {
        setMessageFontSize('text-2xl md:text-3xl'); // Large for short messages
      } else if (messageLength < 250) {
        setMessageFontSize('text-xl md:text-2xl'); // Medium for normal messages
      } else if (messageLength < 400) {
        setMessageFontSize('text-lg md:text-xl'); // Smaller for longer messages
      } else {
        setMessageFontSize('text-base md:text-lg'); // Smallest for very long messages
      }
    }
  }, [content?.missionCommanderMessage]);

  const fetchContent = async () => {
    try {
      const response = await api.get<{ homepage: HomepageContent }>('/public/homepage');
      if (response.success && response.data) {
        setContent(response.data.homepage);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          /* 2-Column Layout: 60% / 40% */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-7xl mx-auto items-center">
            {/* Column 1: 60% - Director's Message with Quote */}
            <div className="lg:col-span-3">
              <div className="relative h-56 md:h-64 flex items-center">
                {/* Large Quote Mark - Top Left */}
                <div className="absolute -top-8 -left-4 text-white/20 text-9xl font-serif leading-none">
                  "
                </div>
                
                {/* Message Content - Fixed Height Container */}
                <div className="relative z-10 text-white w-full">
                  <div className="overflow-y-auto max-h-48 md:max-h-56 pr-2">
                    <p className={`${messageFontSize} font-light leading-relaxed mb-6 italic`}>
                      {content?.missionCommanderMessage || 
                        'To the dedicated members of Saguaro Strikers, your unwavering passion and dedication are the driving forces behind our shared success. Together we are building a brighter future through innovation, teamwork, and excellence in rocketry. Thank you for all you do.'}
                    </p>
                  </div>
                  <div className="text-lg font-medium mt-4">
                    <p className="mb-1">- {content?.missionCommanderName || 'Mission Director'}</p>
                    <p className="text-white/80">{content?.missionCommanderTitle || 'Team Leader'}</p>
                  </div>
                </div>

                {/* Large Quote Mark - Bottom Right */}
                <div className="absolute -bottom-8 -right-4 text-white/20 text-9xl font-serif leading-none">
                  "
                </div>
              </div>

              {/* Mission & Vision Cards */}
              <div className="mt-16 space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                  <div 
                    className="text-white/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content?.vision || '<p>Our vision statement...</p>' }}
                  />
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                  <div 
                    className="text-white/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content?.mission || '<p>Our mission statement...</p>' }}
                  />
                </div>
              </div>
            </div>

            {/* Column 2: 40% - Director Image */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                {/* Circular Profile Image with Gold Border */}
                <div className="relative w-full max-w-md mx-auto">
                  <div 
                    className="relative rounded-full overflow-hidden aspect-square shadow-2xl"
                    style={{ 
                      border: '8px solid #f59e0b',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    {content?.missionCommanderImage ? (
                      <img
                        src={content.missionCommanderImage}
                        alt={content?.missionCommanderName || 'Mission Director'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-8xl mb-4">🚀</div>
                          <p className="text-xl font-semibold">{content?.missionCommanderName || 'Mission Director'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Links Card */}
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20">
                  <h4 className="font-semibold text-white text-lg mb-4">Quick Links</h4>
                  <ul className="space-y-2.5">
                    <li>
                      <a href="/mission-leaders" className="text-white/90 hover:text-white transition-colors flex items-center">
                        <span className="mr-2">→</span> Meet Our Leaders
                      </a>
                    </li>
                    <li>
                      <a href="/missions" className="text-white/90 hover:text-white transition-colors flex items-center">
                        <span className="mr-2">→</span> View Our Missions
                      </a>
                    </li>
                    <li>
                      <a href="/join-mission" className="text-white/90 hover:text-white transition-colors flex items-center">
                        <span className="mr-2">→</span> Join the Team
                      </a>
                    </li>
                    <li>
                      <a href="/contact" className="text-white/90 hover:text-white transition-colors flex items-center">
                        <span className="mr-2">→</span> Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
