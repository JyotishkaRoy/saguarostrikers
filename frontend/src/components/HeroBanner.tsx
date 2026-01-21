import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';

interface HeroCTA {
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

interface HomepageContent {
  heroImages: string[];
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCTAs?: HeroCTA[];
  aboutUs: string;
  vision: string;
  mission: string;
}

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [heroContent, setHeroContent] = useState<HomepageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hero content from API
  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await api.get<{ homepage: HomepageContent }>('/public/homepage');
        if (response.success && response.data) {
          setHeroContent(response.data.homepage);
        }
      } catch (error) {
        console.error('Failed to fetch hero content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  // Default fallback images
  const defaultImages = [
    '/images/banners/Banner 1.png',
    '/images/banners/Banner 2.png',
    '/images/banners/Banner 3.png',
  ];

  const bannerImages = heroContent?.heroImages && heroContent.heroImages.length > 0 
    ? heroContent.heroImages 
    : defaultImages;

  const headline = heroContent?.heroHeadline || 'Saguaro Strikers';
  const subheadline = heroContent?.heroSubheadline || 'Building the Future of Rocketry';
  const ctas = heroContent?.heroCTAs || [];

  useEffect(() => {
    if (!isAutoPlaying || bannerImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, bannerImages.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[450px] md:h-[600px] bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] md:h-[600px] overflow-hidden bg-gray-900">
      {/* Banner Images */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {bannerImages.map((image, index) => (
          <div key={index} className="min-w-full h-full relative">
            <img
              src={image}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = '/images/banners/Banner 1.png';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 image */}
      {bannerImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all z-20"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all z-20"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Overlay Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center text-white px-4 max-w-4xl">
          <h1 
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
              WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.4)',
            }}
          >
            {headline}
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-xl">
            {subheadline}
          </p>
          
          {/* Call-to-Action Buttons */}
          {ctas.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {ctas.map((cta, index) => (
                <Link
                  key={index}
                  to={cta.link}
                  className={`
                    px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg
                    ${cta.style === 'primary' 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                      : 'bg-white hover:bg-gray-100 text-primary-600 border-2 border-white'
                    }
                  `}
                >
                  {cta.text}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
