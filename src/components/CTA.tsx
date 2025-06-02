
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Globe, Zap } from 'lucide-react';

const CTA = () => {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <div className="mb-8">
            <span className="text-6xl mb-4 block">💈</span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-green-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
                Think You Know Ball?
              </span>
              <br />
              <span className="text-white">Prove It.</span>
            </h2>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join the culture. Build your rankings. See if you really know ball.
            <br />
            <span className="text-green-400 font-semibold">The Barbershop is where real fans prove their takes.</span>
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Smartphone className="text-green-400 mx-auto mb-3" size={40} />
              <h3 className="text-white font-bold mb-2">Mobile First</h3>
              <p className="text-gray-400 text-sm">Built for quick takes on the go</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Globe className="text-blue-400 mx-auto mb-3" size={40} />
              <h3 className="text-white font-bold mb-2">Global Community</h3>
              <p className="text-gray-400 text-sm">Fans from every corner of the NBA world</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Zap className="text-red-400 mx-auto mb-3" size={40} />
              <h3 className="text-white font-bold mb-2">Real-Time</h3>
              <p className="text-gray-400 text-sm">Live updates as opinions shift</p>
            </div>
          </div>

          {/* Main CTA */}
          <div className="space-y-6">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-12 py-6 text-xl rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Enter The Barbershop
              <ArrowRight className="ml-3" size={24} />
            </Button>
            
            <div className="text-gray-400 text-sm">
              Free to join • No spam • Real fans only
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-12 border-t border-gray-800">
            <div className="text-gray-400 text-sm mb-4">TRUSTED BY NBA FANS WORLDWIDE</div>
            <div className="flex justify-center items-center space-x-8 text-gray-600">
              <div className="font-bold">47K+ Takes</div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="font-bold">12K+ Rankings</div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="font-bold">8.2K Daily Voters</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
