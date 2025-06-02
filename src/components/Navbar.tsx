
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Trophy, Users, TrendingUp } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Rankings', href: '#rankings', icon: <Trophy size={16} /> },
    { name: 'Community', href: '#community', icon: <Users size={16} /> },
    { name: 'Live Stats', href: '#stats', icon: <TrendingUp size={16} /> },
  ];

  return (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💈</span>
            <span className="text-xl font-bold text-white">The Barbershop</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-green-400 hover:bg-green-400/10"
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-full"
            >
              Start Ranking
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-sm rounded-xl mt-2 p-4 border border-gray-800">
            <div className="space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 text-gray-300 hover:text-green-400 transition-colors duration-200 p-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              ))}
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full text-white hover:text-green-400 hover:bg-green-400/10"
                >
                  Sign In
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-full"
                >
                  Start Ranking
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
