import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { HomepageContent } from '@/types';

export default function MissionStatement() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

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
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* 2-Column Layout: 60% / 40% */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
          {/* Column 1: 60% - Mission Statement Text */}
          <div className="lg:col-span-3">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Mission Statement from the Mission Commander
            </h1>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Our Vision
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {content?.vision || 
                      'To be a leading force in amateur rocketry, inspiring innovation and excellence in aerospace education. We strive to create an environment where students can explore, learn, and push the boundaries of what\'s possible in rocketry and aerospace engineering.'}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Our Mission
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {content?.mission || 
                      'To provide students with hands-on experience in rocket design, engineering, and flight operations while fostering teamwork, problem-solving, and scientific inquiry. We aim to develop the next generation of aerospace professionals through practical experience and mentorship.'}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    About Us
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {content?.aboutUs ? (
                      <div dangerouslySetInnerHTML={{ __html: content.aboutUs }} />
                    ) : (
                      <>
                        <p>
                          Saguaro Strikers is more than just a rocketry team – we're a community of passionate individuals dedicated to advancing aerospace education and inspiring the next generation of engineers and scientists.
                        </p>
                        <p>
                          Founded with the goal of providing students with real-world engineering experience, we participate in national competitions including the American Rocketry Challenge, Spaceport America Cup, and other prestigious events.
                        </p>
                        <p>
                          Our team members gain invaluable experience in:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Rocket design and aerodynamics</li>
                          <li>Propulsion systems and motor selection</li>
                          <li>Avionics and flight computers</li>
                          <li>Recovery systems and parachute deployment</li>
                          <li>Project management and teamwork</li>
                          <li>Safety protocols and launch operations</li>
                        </ul>
                        <p>
                          Join us on our journey to reach new heights!
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href="/join-mission"
                    className="btn-primary inline-flex items-center"
                  >
                    Join Our Team
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: 40% - Commander Image */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-96 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <img
                    src="/images/commander-placeholder.jpg"
                    alt="Mission Commander"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-white text-center p-8"><div class="text-8xl mb-4">🚀</div><p class="text-xl font-semibold">Mission Commander</p></div>';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Mission Commander
                  </h3>
                  <p className="text-primary-600 font-medium mb-4">
                    Team Leader
                  </p>
                  <p className="text-gray-600 text-sm">
                    Leading the Saguaro Strikers to new heights in rocketry excellence.
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="/mission-leaders" className="text-primary-600 hover:text-primary-700">
                      → Meet Our Leaders
                    </a>
                  </li>
                  <li>
                    <a href="/competitions" className="text-primary-600 hover:text-primary-700">
                      → View Our Missions
                    </a>
                  </li>
                  <li>
                    <a href="/join-mission" className="text-primary-600 hover:text-primary-700">
                      → Join the Team
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-primary-600 hover:text-primary-700">
                      → Contact Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
