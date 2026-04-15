
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Car, Facebook, Instagram, Twitter, UserCircle, ChevronRight, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { NAV_LINKS, COMPANY_NAME, CONTACT_PHONE, CONTACT_EMAIL } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Check if we are on the home page
  const isHomePage = location.pathname === '/';

  // The navbar should be solid (white background, dark text) if:
  // 1. We are NOT on the home page
  // 2. We have scrolled down
  // 3. The mobile menu is open
  const isNavSolid = !isHomePage || scrolled || isOpen;

  // Check if the user is a staff member (Driver or Admin)
  const isStaff = isAuthenticated && (user?.role === UserRole.DRIVER || user?.role === UserRole.ADMIN);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      // Admins primarily view the Driver Dashboard context
      case UserRole.ADMIN: return '/driver-dashboard';
      case UserRole.DRIVER: return '/driver-dashboard';
      default: return '/student-dashboard';
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdminPortalActive = isActive('/admin-dashboard');

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isNavSolid ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            {/* If user is staff, logo redirects to dashboard instead of home */}
            <Link to={isStaff ? getDashboardLink() : "/"} className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className={`p-2 rounded-xl transition-colors ${isNavSolid ? 'bg-brand-600' : 'bg-brand-600 md:bg-white'}`}>
                <Car className={`h-6 w-6 ${isNavSolid ? 'text-white' : 'text-white md:text-brand-600'}`} />
              </div>
              <span className={`font-display font-bold text-xl tracking-tight ${isNavSolid ? 'text-slate-900' : 'text-slate-900 md:text-white'}`}>
                501 <span className={isNavSolid ? 'text-brand-600' : 'text-brand-600 md:text-white/90'}>drivingschool</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center gap-1">
            {/* Hide public nav links for Staff (Instructors/Admins) */}
            {!isStaff && NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive(link.path)
                  ? (isNavSolid ? 'text-brand-700 bg-brand-50' : 'text-brand-900 bg-white')
                  : (isNavSolid ? 'text-slate-600 hover:text-brand-600 hover:bg-slate-50' : 'text-white/90 hover:text-white hover:bg-white/10')
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-3">
                {user?.role === UserRole.ADMIN && (
                  <Link
                    to="/admin-dashboard"
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all shadow-sm border ${isAdminPortalActive
                      ? 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700'
                      : (isNavSolid
                        ? 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-brand-600'
                        : 'text-brand-900 bg-white border-transparent hover:bg-slate-100'
                      )
                      }`}
                  >
                    <ShieldCheck className={`h-4 w-4 ${isAdminPortalActive ? 'text-white' : ''}`} />
                    Admin Portal
                  </Link>
                )}

                <Link
                  to={getDashboardLink()}
                  className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all shadow-sm ${isNavSolid
                    ? 'text-white bg-slate-900 hover:bg-slate-800'
                    : 'text-slate-900 bg-white hover:bg-slate-100'
                    }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-full transition-all ${isNavSolid ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all shadow-sm ml-3 ${isNavSolid
                  ? 'text-white bg-slate-900 hover:bg-slate-800'
                  : 'text-slate-900 bg-white hover:bg-slate-100'
                  }`}
              >
                <UserCircle className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none ${isNavSolid ? 'text-slate-600' : 'text-white'
                }`}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full bg-white border-b border-slate-100 shadow-lg transition-all duration-300 ease-in-out origin-top ${isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 h-0'}`}>
        <div className="px-4 pt-4 pb-6 space-y-2">
          {!isStaff && NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive(link.path)
                ? 'text-brand-700 bg-brand-50'
                : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center justify-between">
                {link.label}
                <ChevronRight className="w-4 h-4 opacity-50" />
              </div>
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <>
                {user?.role === UserRole.ADMIN && (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`block w-full text-center px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-2 border ${isActive('/admin-dashboard')
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin Portal
                  </Link>
                )}
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 mb-2"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <UserCircle className="h-5 w-5" />
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-brand-600 p-1.5 rounded-lg">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl">501 drivingschool</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Professional, patient, and friendly driving tuition tailored to your individual needs. Empowering safe drivers for life.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6">Navigation</h3>
            <ul className="space-y-4">
              {NAV_LINKS.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6">Legal</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Student Code of Conduct</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Email</span>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-white hover:text-brand-400 transition-colors">{CONTACT_EMAIL}</a>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Phone</span>
                <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="text-white hover:text-brand-400 transition-colors">{CONTACT_PHONE}</a>
              </li>
            </ul>
            <p className="text-slate-500 text-xs mt-8">
              &copy; {new Date().getFullYear()} {COMPANY_NAME}. <br />All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};
