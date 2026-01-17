import { Mail } from 'lucide-react';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-2 border-gray-200 bg-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section: Logo and Text */}
          <div className="flex items-center gap-4">
            <img 
              src="/images/logo/Logo.png" 
              alt="Saguaro Strikers Logo" 
              className="h-16 w-16"
            />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Saguaro Strikers</h3>
              <p className="text-sm text-gray-600 max-w-xl">
                A STEM club to inspire, nurture and engage Arizona enthusiasts in the fields of Rocketry and Robotics
              </p>
            </div>
          </div>

          {/* Center Section: Email and Copyright */}
          <div className="flex flex-col items-center gap-2 text-center">
            <a 
              href="mailto:admin@saguarostrikers.org" 
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span>admin@saguarostrikers.org</span>
            </a>
            <p className="text-sm text-gray-600">
              © Saguaro Strikers. All rights reserved.
            </p>
          </div>

          {/* Right Section: Social Media */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 font-medium">Follow us on:</span>
            <div className="flex gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-800 text-white rounded-full p-2 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-800 text-white rounded-full p-2 transition-colors"
                aria-label="Twitter/X"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-800 text-white rounded-full p-2 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
