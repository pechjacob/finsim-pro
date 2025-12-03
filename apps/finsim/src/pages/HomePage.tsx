import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white overflow-hidden relative">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/30 to-gray-900/50"></div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
                backgroundSize: '100px 100px'
            }}></div>

            {/* Abstract chart visualization */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1000 600" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.3 }} />
                        <stop offset="50%" style={{ stopColor: '#a78bfa', stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.3 }} />
                    </linearGradient>
                </defs>
                <path
                    d="M 0,500 L 100,450 L 200,420 L 300,380 L 400,350 L 500,320 L 600,280 L 700,250 L 800,200 L 900,150 L 1000,100 L 1000,600 L 0,600 Z"
                    fill="url(#chartGradient)"
                    opacity="0.4"
                />
                <polyline
                    points="0,500 100,450 200,420 300,380 400,350 500,320 600,280 700,250 800,200 900,150 1000,100"
                    fill="none"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="2"
                />
                {/* Additional chart lines */}
                <polyline
                    points="0,550 150,520 300,480 450,460 600,400 750,370 900,320 1000,280"
                    fill="none"
                    stroke="rgba(168,139,250,0.4)"
                    strokeWidth="2"
                />
                <polyline
                    points="0,480 200,460 400,420 600,380 800,340 1000,300"
                    fill="none"
                    stroke="rgba(96,165,250,0.3)"
                    strokeWidth="2"
                />
            </svg>

            {/* Navigation */}
            {/* Navigation */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 flex items-center justify-between shadow-2xl">
                {/* Logo */}
                <div className="flex items-center space-x-3 pl-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-inner">
                        <img
                            src={import.meta.env.BASE_URL + 'logo.jpg'}
                            alt="FinSim Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-lg font-bold text-white tracking-wide">FinSim Pro</span>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#team" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Our Team</a>
                    <a href="#plans" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Plans</a>
                    <a href="#blog" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Blog</a>
                    <a href="#faq" className="text-white/80 hover:text-white transition-colors text-sm font-medium">FAQ</a>
                </div>

                {/* CTA Button */}
                <div className="pr-1">
                    <Link
                        to="/app"
                        className="px-6 py-2 bg-white text-gray-900 rounded-full text-sm font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Try Now
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center justify-center px-8 mt-32">
                <h2 className="text-7xl font-bold text-center mb-6 tracking-tight">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        Talk To Your Finances
                    </span>
                </h2>

                <p className="text-white/70 text-sm font-mono tracking-wider">
                    [Scroll to discover ]
                </p>

                {/* Scroll indicator */}
                <div className="mt-16 animate-bounce">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Footer spacer */}
            <div className="h-32"></div>
        </div>
    );
};
