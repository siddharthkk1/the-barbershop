
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, TrendingUp } from 'lucide-react';

const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
              <span className="text-2xl">💈</span>
              <span className="text-xl font-bold">The Barbershop</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in">
            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
              Where NBA Fans
            </span>
            <br />
            <span className="text-white">Settle Debates</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Rank players. Vote on matchups. See how your takes stack up against the world.
            <br />
            <span className="text-green-400 font-semibold">Less noise than Twitter. More culture than ESPN.</span>
          </p>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-12 animate-fade-in">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">47K+</div>
              <div className="text-gray-400">Hot Takes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">12K+</div>
              <div className="text-gray-400">Rankings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">8.2K</div>
              <div className="text-gray-400">Daily Voters</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Start Ranking
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 font-bold px-8 py-4 text-lg rounded-full transition-all duration-300"
            >
              Check Live Rankings
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mt-12 animate-fade-in">
            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Zap className="text-yellow-400" size={16} />
              <span className="text-sm">Real-time Rankings</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Users className="text-blue-400" size={16} />
              <span className="text-sm">You vs The World</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <TrendingUp className="text-green-400" size={16} />
              <span className="text-sm">Hot Take Tracker</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
          <div className="w-1 h-3 bg-white/60 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
