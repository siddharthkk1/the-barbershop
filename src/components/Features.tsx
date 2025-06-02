
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Zap, Target, Share2, TrendingUp } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Trophy className="text-yellow-400" size={32} />,
      title: "Fan Rankings",
      description: "Build your personal Top 10 lists with drag-and-drop. Auto-generate clean shareable images.",
      highlight: "Your takes, your way"
    },
    {
      icon: <TrendingUp className="text-green-400" size={32} />,
      title: "Live Consensus",
      description: "Real-time leaderboards showing who's rising, falling, or getting no love from the culture.",
      highlight: "See the pulse of NBA fans"
    },
    {
      icon: <Target className="text-red-400" size={32} />,
      title: "You vs The World",
      description: "Compare your rankings to the consensus. 'You put Brunson at #3 — only 4% agree'",
      highlight: "Find your basketball identity"
    },
    {
      icon: <Zap className="text-blue-400" size={32} />,
      title: "Flash Polls",
      description: "Weekly hot takes and quick votes. 'Is Shai top 5?' Visual results shown instantly.",
      highlight: "Capture the moment"
    },
    {
      icon: <Users className="text-purple-400" size={32} />,
      title: "Friend Groups",
      description: "Add friends, create private groups, see who's the boldest and most accurate predictor.",
      highlight: "Squad debates"
    },
    {
      icon: <Share2 className="text-pink-400" size={32} />,
      title: "Culture Tracking",
      description: "Follow basketball culture day by day. See how opinions evolve with games and news.",
      highlight: "Real fan sentiment"
    }
  ];

  return (
    <section className="bg-gray-900 py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Features That Hit Different
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We built this for the culture. Every feature designed to capture how NBA fans really think and debate.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 group hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 mb-3 leading-relaxed">{feature.description}</p>
                <div className="text-sm font-semibold text-green-400">
                  {feature.highlight}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-block bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-8 border border-green-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Coming Soon: AI Takes Analysis</h3>
            <p className="text-gray-300 max-w-2xl">
              We're building AI that understands basketball culture to give you insights on your takes, 
              predict consensus shifts, and help you find your basketball personality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
