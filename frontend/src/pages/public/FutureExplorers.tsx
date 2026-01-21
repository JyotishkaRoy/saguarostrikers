import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProgramImage {
  id: string;
  url: string;
  caption?: string;
}

export default function FutureExplorers() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample images - In production, these would come from API
  const programImages: ProgramImage[] = [
    {
      id: '1',
      url: '/images/banners/Banner 1.png',
      caption: 'Students learning rocket design',
    },
    {
      id: '2',
      url: '/images/banners/Banner 2.png',
      caption: 'Hands-on workshop session',
    },
    {
      id: '3',
      url: '/images/banners/Banner 3.png',
      caption: 'Launch day excitement',
    },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % programImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + programImages.length) % programImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Future Explorers' Program
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Inspiring the next generation of aerospace engineers through hands-on learning and mentorship
          </p>
        </div>

        {/* Row 1: 2-Column Layout (60% / 40%) */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Column 1: 60% - Text Content */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    About the Program
                  </h2>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The Future Explorers' Program is our flagship outreach initiative designed to introduce students to the exciting world of rocketry and aerospace engineering. Through interactive workshops, demonstrations, and mentorship opportunities, we aim to inspire curiosity and develop practical STEM skills.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                    What We Offer
                  </h3>
                  
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-primary-600 font-bold mr-3">→</span>
                      <span><strong>Interactive Workshops:</strong> Hands-on sessions covering rocket design, aerodynamics, and propulsion systems</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 font-bold mr-3">→</span>
                      <span><strong>Mentorship Program:</strong> One-on-one guidance from experienced team members</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 font-bold mr-3">→</span>
                      <span><strong>Launch Events:</strong> Opportunities to witness and participate in rocket launches</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 font-bold mr-3">→</span>
                      <span><strong>Team Missions:</strong> Collaborative challenges to build and test rocket designs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 font-bold mr-3">→</span>
                      <span><strong>Career Guidance:</strong> Insights into aerospace careers and educational pathways</span>
                    </li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                    Who Can Join?
                  </h3>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The program is open to middle and high school students (grades 6-12) who are curious about rocketry and aerospace. No prior experience is required – just enthusiasm and a willingness to learn!
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <a href="/join-mission" className="btn-primary">
                      Apply to Join
                    </a>
                    <a href="/contact" className="btn-outline">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: 40% - Image Carousel */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Image Carousel */}
                  <div className="relative h-96 bg-gray-900">
                    <img
                      src={programImages[currentImageIndex].url}
                      alt={programImages[currentImageIndex].caption || 'Program activity'}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    {programImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronLeft className="h-6 w-6 text-gray-900" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronRight className="h-6 w-6 text-gray-900" />
                        </button>
                      </>
                    )}

                    {/* Caption */}
                    {programImages[currentImageIndex].caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
                        <p className="text-sm">{programImages[currentImageIndex].caption}</p>
                      </div>
                    )}
                  </div>

                  {/* Dots */}
                  {programImages.length > 1 && (
                    <div className="flex justify-center space-x-2 p-4">
                      {programImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-primary-600 w-8'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Program Details</h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">8-12 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Age Group:</span>
                      <span className="font-medium">Grades 6-12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">Arizona</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Full-Width Rich Text Area */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Success Stories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Testimonial 1 */}
              <div className="border-l-4 border-primary-600 pl-6">
                <p className="text-gray-700 italic mb-4">
                  "The Future Explorers' Program changed my life. I went from knowing nothing about rocketry to designing my own rockets and pursuing aerospace engineering in college. The mentorship and hands-on experience were invaluable."
                </p>
                <p className="text-gray-900 font-semibold">— Alex M., Alumni</p>
                <p className="text-gray-600 text-sm">Now studying Aerospace Engineering at MIT</p>
              </div>

              {/* Testimonial 2 */}
              <div className="border-l-4 border-primary-600 pl-6">
                <p className="text-gray-700 italic mb-4">
                  "As a parent, I couldn't be happier with this program. My daughter discovered her passion for STEM and made lifelong friends. The team is professional, safety-focused, and genuinely cares about the students."
                </p>
                <p className="text-gray-900 font-semibold">— Parent of Program Participant</p>
                <p className="text-gray-600 text-sm">2025 Cohort</p>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Program Highlights
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-primary-50 rounded-lg">
                  <div className="text-4xl font-bold text-primary-600 mb-2">200+</div>
                  <div className="text-gray-700">Students Reached</div>
                </div>
                <div className="text-center p-6 bg-primary-50 rounded-lg">
                  <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
                  <div className="text-gray-700">Workshops Conducted</div>
                </div>
                <div className="text-center p-6 bg-primary-50 rounded-lg">
                  <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                  <div className="text-gray-700">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Join the Next Generation of Explorers?
              </h3>
              <p className="text-gray-600 mb-6">
                Applications are now open for our upcoming cohort. Don't miss this opportunity!
              </p>
              <a href="/join-mission" className="btn-primary inline-flex items-center">
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
