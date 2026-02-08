import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import useAuthStore from '../stores/authStore';

function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Interactive Mesh Grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-30" style={{ 
            transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px) scale(${1 + (mousePosition.x - 50) * 0.001})`,
            transition: 'transform 0.15s ease-out'
          }}>
            <defs>
              <pattern id="meshPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#737373" strokeWidth="1" />
                <circle cx="40" cy="40" r="2" fill="#737373" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#meshPattern)" />
          </svg>
          {/* Additional mesh layer */}
          <svg className="absolute inset-0 w-full h-full opacity-15" style={{ 
            transform: `translate(${(mousePosition.x - 50) * -0.1}px, ${(mousePosition.y - 50) * -0.1}px) rotate(${(mousePosition.x - 50) * 0.1}deg)`,
            transition: 'transform 0.2s ease-out'
          }}>
            <defs>
              <pattern id="meshPattern2" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#525252" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#meshPattern2)" />
          </svg>
        </div>

        {/* Interactive Globe */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 right-10 w-[500px] h-[500px] pointer-events-none opacity-40"
          style={{
            transform: `translate(${(mousePosition.x - 50) * 0.4}px, ${(mousePosition.y - 50) * 0.4}px) rotateX(${(mousePosition.y - 50) * 0.8}deg) rotateY(${(mousePosition.x - 50) * 0.8}deg) scale(${1 + Math.abs(mousePosition.x - 50) * 0.002})`,
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <radialGradient id="globeGradient">
                <stop offset="0%" stopColor="#404040" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#262626" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#171717" stopOpacity="0.3" />
              </radialGradient>
              <linearGradient id="globeHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Main globe circle */}
            <circle cx="100" cy="100" r="85" fill="url(#globeGradient)" stroke="#404040" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="85" fill="url(#globeHighlight)" />
            {/* Latitude lines */}
            {[...Array(9)].map((_, i) => {
              const y = 20 + i * 20;
              const radius = Math.sqrt(85 * 85 - Math.pow(y - 100, 2));
              return (
                <ellipse
                  key={`lat-${i}`}
                  cx="100"
                  cy={y}
                  rx={radius}
                  ry={radius * 0.3}
                  fill="none"
                  stroke="#525252"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
              );
            })}
            {/* Longitude lines */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180);
              const x1 = 100 + 85 * Math.cos(angle);
              const y1 = 100 + 85 * Math.sin(angle);
              const x2 = 100 - 85 * Math.cos(angle);
              const y2 = 100 - 85 * Math.sin(angle);
              return (
                <line
                  key={`lon-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#525252"
                  strokeWidth="0.6"
                  opacity="0.4"
                />
              );
            })}
            {/* Grid overlay */}
            {[...Array(10)].map((_, i) => (
              <line
                key={`grid-h-${i}`}
                x1="15"
                y1={15 + i * 17}
                x2="185"
                y2={15 + i * 17}
                stroke="#737373"
                strokeWidth="0.4"
                opacity="0.2"
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <line
                key={`grid-v-${i}`}
                x1={15 + i * 17}
                y1="15"
                x2={15 + i * 17}
                y2="185"
                stroke="#737373"
                strokeWidth="0.4"
                opacity="0.2"
              />
            ))}
            {/* Center point */}
            <circle cx="100" cy="100" r="3" fill="#525252" opacity="0.6" />
          </svg>
        </div>
        
        {/* Additional mouse-responsive floating elements */}
        <div 
          className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-neutral-400/40 rounded-lg pointer-events-none"
          style={{
            transform: `translate(${(mousePosition.x - 50) * 0.2}px, ${(mousePosition.y - 50) * 0.2}px) rotate(${(mousePosition.x - 50) * 0.3}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/3 w-16 h-16 border-2 border-neutral-400/40 rounded-full pointer-events-none"
          style={{
            transform: `translate(${(mousePosition.x - 50) * -0.15}px, ${(mousePosition.y - 50) * -0.15}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        />

        {/* Animated Wave Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* SVG Waves with animated motion */}
          <svg className="absolute bottom-0 left-0 w-full h-full opacity-40" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f5f5f5" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#e5e5e5" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f5f5f5" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e5e5e5" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#d4d4d4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#e5e5e5" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f5f5f5" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#e5e5e5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f5f5f5" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <g className="animate-wave">
              <path
                d="M0,200 Q300,150 600,200 T1200,200 L1200,400 L0,400 Z"
                fill="url(#waveGradient1)"
              />
            </g>
            <g className="animate-wave-delayed">
              <path
                d="M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z"
                fill="url(#waveGradient2)"
              />
            </g>
            <g className="animate-wave-slow">
              <path
                d="M0,300 Q300,250 600,300 T1200,300 L1200,400 L0,400 Z"
                fill="url(#waveGradient3)"
              />
            </g>
          </svg>

          {/* Floating circles with continuous animation - mouse responsive */}
          <div 
            className="absolute top-20 right-20 w-72 h-72 bg-neutral-400 rounded-full blur-3xl opacity-40 animate-float"
            style={{
              transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
            }}
          />
          <div 
            className="absolute bottom-20 left-20 w-96 h-96 bg-neutral-300 rounded-full blur-3xl opacity-35 animate-float-delayed"
            style={{
              transform: `translate(${(mousePosition.x - 50) * -0.08}px, ${(mousePosition.y - 50) * -0.08}px)`,
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-200 rounded-full blur-3xl opacity-30 animate-pulse-slow"
            style={{
              transform: `translate(calc(-50% + ${(mousePosition.x - 50) * 0.05}px), calc(-50% + ${(mousePosition.y - 50) * 0.05}px))`,
            }}
          />
          
          {/* Geometric shapes */}
          <div className="absolute top-40 left-1/4 w-32 h-32 border-2 border-neutral-300/30 rotate-45 animate-spin-slow" />
          <div className="absolute bottom-40 right-1/4 w-24 h-24 border-2 border-neutral-300/30 rounded-full animate-bounce-slow" />
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-neutral-300/20 rounded-lg rotate-12 animate-float" />
          
          {/* Additional floating particles */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-neutral-400/40 rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-neutral-400/40 rounded-full animate-float-delayed" style={{ animationDelay: '4s' }} />
          <div className="absolute bottom-1/4 left-2/3 w-4 h-4 bg-neutral-400/30 rounded-full animate-float" style={{ animationDelay: '6s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-neutral-900 mb-6 leading-tight">
              Find Your
              <span className="block mt-2 bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent font-bold">
                Dream Job
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-600 max-w-2xl mx-auto mb-10 font-normal">
              Connect with top employers and discover opportunities that match your skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated() ? (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3.5 text-base font-medium text-neutral-900 border-2 border-neutral-900 rounded-lg hover:bg-neutral-900 hover:text-white transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/jobs"
                  className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Browse Jobs
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto font-medium">
              Everything you need to advance your career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Thousands of Jobs',
                description: 'Access a wide range of opportunities from leading companies across various industries.',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Secure & Trusted',
                description: 'Your data is protected with industry-leading security measures and privacy controls.',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Fast & Easy',
                description: 'Apply to jobs in minutes with our streamlined application process and smart matching.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className="text-neutral-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Active Jobs' },
              { number: '5K+', label: 'Companies' },
              { number: '50K+', label: 'Job Seekers' },
              { number: '98%', label: 'Success Rate' },
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transitionDelay: `${500 + index * 100}ms` }}
              >
                <div className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-neutral-600 uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-800" />
        
        {/* Animated Wave Background for CTA */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradientDark1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="waveGradientDark2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <g className="animate-wave">
              <path
                d="M0,100 Q300,50 600,100 T1200,100 L1200,400 L0,400 Z"
                fill="url(#waveGradientDark1)"
              />
            </g>
            <g className="animate-wave-delayed">
              <path
                d="M0,150 Q300,100 600,150 T1200,150 L1200,400 L0,400 Z"
                fill="url(#waveGradientDark2)"
              />
            </g>
          </svg>
        </div>
        
        <div className="absolute inset-0">
          <div className={`absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl transition-all duration-1000 ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
          <div className={`absolute bottom-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl transition-all duration-1000 delay-300 ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className={`transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-neutral-200 mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of professionals who have found their dream jobs through our platform
            </p>
            {!isAuthenticated() ? (
              <Link
                to="/register"
                className="inline-block px-10 py-4 text-base font-medium text-neutral-900 bg-white rounded-lg hover:bg-neutral-100 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Create Free Account
              </Link>
            ) : (
              <Link
                to="/jobs"
                className="inline-block px-10 py-4 text-base font-medium text-neutral-900 bg-white rounded-lg hover:bg-neutral-100 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Explore Jobs
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="text-xl font-light text-neutral-900">
                JobBoard
              </Link>
            </div>
            <div className="flex gap-6 text-sm text-neutral-500">
              <Link to="/" className="hover:text-neutral-900 transition-colors">About</Link>
              <Link to="/" className="hover:text-neutral-900 transition-colors">Contact</Link>
              <Link to="/" className="hover:text-neutral-900 transition-colors">Privacy</Link>
              <Link to="/" className="hover:text-neutral-900 transition-colors">Terms</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-400">
            <p>&copy; {new Date().getFullYear()} JobBoard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
