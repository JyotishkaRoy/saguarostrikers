import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, UserCircle, Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showStrikersDropdown, setShowStrikersDropdown] = useState(false);
  const [showMobileStrikersDropdown, setShowMobileStrikersDropdown] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isStrikersActive = () => isActive('/mission-statement') || isActive('/mission-leaders');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 shadow-lg">
      <div className="flex items-stretch">
        {/* Logo Section with White Background */}
        <div className="bg-white flex items-center px-6 relative">
          <Link to="/" className="flex items-center space-x-3 py-3">
            <div className="h-14 w-14 flex items-center justify-center">
              <img 
                src="/images/logo/Logo.png" 
                alt="Saguaro Strikers" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <span className="text-xl font-bold text-primary-900 hidden lg:block whitespace-nowrap">Saguaro Strikers</span>
          </Link>
          
          {/* Tilted Divider */}
          <div 
            className="absolute -right-6 top-0 bottom-0 w-12 bg-white transform skew-x-[-12deg] origin-bottom"
            style={{ zIndex: 1 }}
          ></div>
        </div>

        {/* Navigation Section with Blue Background */}
        <div className="flex-1 bg-gradient-to-r from-primary-900 to-primary-800 border-b border-primary-200">
          <div className="container mx-auto px-4 pl-8">
            <div className="flex h-16 items-center justify-between">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:items-center lg:gap-1 text-sm flex-1">
            <Link 
              to="/" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/') && "underline underline-offset-4 decoration-2"
              )}
            >
              Home
            </Link>
            <span className="text-white/50">|</span>
            
            {/* Know the Strikers Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowStrikersDropdown(true)}
              onMouseLeave={() => setShowStrikersDropdown(false)}
            >
              <button 
                className={cn(
                  "text-white hover:text-secondary-300 transition-colors px-2 py-1 flex items-center gap-1",
                  isStrikersActive() && "underline underline-offset-4 decoration-2"
                )}
              >
                Know the Strikers
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {/* Dropdown Menu */}
              <div className={cn(
                "absolute left-0 mt-2 w-64 origin-top-left rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition-all z-50",
                showStrikersDropdown ? "opacity-100 visible" : "opacity-0 invisible"
              )}>
                <Link
                  to="/mission-statement"
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mission Statement from the Mission Director
                </Link>
                <Link
                  to="/mission-leaders"
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mission Leaders
                </Link>
              </div>
            </div>
            <span className="text-white/50">|</span>
            
            <Link 
              to="/missions" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/missions') && "underline underline-offset-4 decoration-2"
              )}
            >
              Missions
            </Link>
            <span className="text-white/50">|</span>
            
            <Link 
              to="/mission-calendar" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/mission-calendar') && "underline underline-offset-4 decoration-2"
              )}
            >
              Mission Calendar
            </Link>
            <span className="text-white/50">|</span>
            
            <Link 
              to="/join-mission" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/join-mission') && "underline underline-offset-4 decoration-2"
              )}
            >
              Join a Mission?
            </Link>
            <span className="text-white/50">|</span>
            
            <Link 
              to="/future-explorers" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/future-explorers') && "underline underline-offset-4 decoration-2"
              )}
            >
              Future Explorers
            </Link>
            <span className="text-white/50">|</span>
            
            <Link 
              to="/contact" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/contact') && "underline underline-offset-4 decoration-2"
              )}
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                <span className="text-white/50">|</span>
                <div className="relative group">
                  <button className="flex items-center space-x-2 rounded-lg bg-primary-700 px-3 py-2 text-sm text-white hover:bg-primary-600 transition-colors">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserCircle className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Portal</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-white/50">|</span>
                <Link 
                  to="/login" 
                  className={cn(
                    "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                    isActive('/login') && "underline underline-offset-4 decoration-2"
                  )}
                >
                  Login
                </Link>
                <span className="text-white/50">|</span>
                <Link 
                  to="/register" 
                  className={cn(
                    "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                    isActive('/register') && "underline underline-offset-4 decoration-2"
                  )}
                >
                  Register
                </Link>
              </>
            )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden rounded-lg p-2 hover:bg-primary-700 text-white"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className={cn('lg:hidden overflow-hidden transition-all', isOpen ? 'max-h-screen pb-4' : 'max-h-0')}>
              <div className="space-y-2 pt-2">
            <Link to="/" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/') && "bg-primary-700")}>
              Home
            </Link>
            
            {/* Know the Strikers Mobile Dropdown */}
            <div>
              <button
                onClick={() => setShowMobileStrikersDropdown(!showMobileStrikersDropdown)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-white hover:bg-primary-700",
                  isStrikersActive() && "bg-primary-700"
                )}
              >
                <span>Know the Strikers</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", showMobileStrikersDropdown && "rotate-180")} />
              </button>
              {showMobileStrikersDropdown && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    to="/mission-statement"
                    className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/mission-statement') && "bg-primary-700")}
                  >
                    Mission Statement from the Mission Director
                  </Link>
                  <Link
                    to="/mission-leaders"
                    className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/mission-leaders') && "bg-primary-700")}
                  >
                    Mission Leaders
                  </Link>
                </div>
              )}
            </div>
            <Link to="/missions" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/missions') && "bg-primary-700")}>
              Missions
            </Link>
            <Link to="/mission-calendar" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/mission-calendar') && "bg-primary-700")}>
              Mission Calendar
            </Link>
            <Link to="/join-mission" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/join-mission') && "bg-primary-700")}>
              Join a Mission?
            </Link>
            <Link to="/future-explorers" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/future-explorers') && "bg-primary-700")}>
              Future Explorers
            </Link>
            <Link to="/contact" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/contact') && "bg-primary-700")}>
              Contact
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block rounded-lg px-3 py-2 text-white hover:bg-primary-700"
                >
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block rounded-lg px-3 py-2 text-white hover:bg-primary-700"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-white hover:bg-primary-700"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block rounded-lg px-3 py-2 text-white hover:bg-primary-700">
                  Login
                </Link>
                <Link to="/register" className="block rounded-lg bg-secondary-500 px-3 py-2 text-white hover:bg-secondary-600">
                  Register
                </Link>
              </>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
