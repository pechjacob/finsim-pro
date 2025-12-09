import React from 'react';
import { Link } from 'react-router-dom';
import { PixelatedCanvas } from '../components/PixelatedCanvas';

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans">
            {/* Background: Pixelated Canvas */}
            <div className="absolute inset-0 z-0">
                <PixelatedCanvas
                    src={import.meta.env.BASE_URL + 'landing-bg-pixel-v2.png'}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    cellSize={4}
                    dotScale={0.9}
                    shape="square"
                    backgroundColor="#000000"
                    dropoutStrength={0.1}
                    interactive
                    distortionStrength={0.1}
                    distortionRadius={200}
                    distortionMode="repel"
                    followSpeed={0.2}
                    jitterStrength={4}
                    jitterSpeed={1}
                    sampleAverage
                    tintColor="#18181b"
                    tintStrength={0.5}
                    className="w-full h-full object-cover"
                    responsive
                />
                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent pointer-events-none"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 flex items-center justify-between shadow-2xl">
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
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pointer-events-none">
                <div className="space-y-6 text-center max-w-4xl mx-auto">
                    <h2 className="text-7xl md:text-8xl font-black tracking-tighter mix-blend-screen">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                            Talk To Your Finances
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                        Visualize your financial future with interactive simulations.
                    </p>

                    <div className="pt-8 pointer-events-auto">
                        <Link
                            to="/app"
                            className="inline-flex items-center space-x-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg hover:shadow-white/20"
                        >
                            <span>Launch Application</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
