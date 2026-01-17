import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, UserCircle, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-primary-200 bg-gradient-to-r from-primary-900 to-primary-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div 
              className="h-14 w-14 flex items-center justify-center rounded-md shadow-md border border-primary-700" 
              style={{ backgroundColor: '#0a3e6e' }}
            >
              <img 
                src="/images/logo/Logo.png" 
                alt="Saguaro Strikers" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <span className="text-xl font-bold text-secondary-400 hidden lg:block">Saguaro Strikers</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1 text-sm">
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
            
            <Link 
              to="/mission-statement" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/mission-statement') && "underline underline-offset-4 decoration-2"
              )}
            >
              Mission Statement
            </Link>
            <span className="text-white/50">|</span>
            
            <Link 
              to="/mission-leaders" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/mission-leaders') && "underline underline-offset-4 decoration-2"
              )}
            >
              Mission Leaders
            </Link>
            <span className="text-white/50">|</span>
            
            <Link 
              to="/competitions" 
              className={cn(
                "text-white hover:text-secondary-300 transition-colors px-2 py-1",
                isActive('/competitions') && "underline underline-offset-4 decoration-2"
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
            <Link to="/mission-statement" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/mission-statement') && "bg-primary-700")}>
              Mission Statement
            </Link>
            <Link to="/mission-leaders" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/mission-leaders') && "bg-primary-700")}>
              Mission Leaders
            </Link>
            <Link to="/competitions" className={cn("block rounded-lg px-3 py-2 text-white hover:bg-primary-700", isActive('/competitions') && "bg-primary-700")}>
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
    </nav>
  );
}
