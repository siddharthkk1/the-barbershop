
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      text: "Finally a place where my hot takes get the respect they deserve. Been saying Ant > Zion since day one and now I got the receipts 📈",
      author: "@HoopsDreamer23",
      role: "Day 1 User",
      rating: 5,
      highlight: "Had Ant top 5 before it was cool"
    },
    {
      text: "Love how this captures real fan opinion vs media narratives. The consensus rankings hit different than ESPN's trash lists 💯",
      author: "@NBAAnalytics_",
      role: "Consensus Tracker",
      rating: 5,
      highlight: "Data > Media narratives"
    },
    {
      text: "My group chat uses this to settle every debate now. No more arguing for hours - we just check The Barbershop and see who's cooking 🔥",
      author: "@LakersNation4L",
      role: "Group Debate Settler",
      rating: 5,
      highlight: "Ended the group chat wars"
    },
    {
      text: "Been tracking my takes vs the world for 3 months. Currently 73% ahead of consensus on player rankings. I might be HIM 👑",
      author: "@BasketballIQ200",
      role: "Take Tracker",
      rating: 5,
      highlight: "73% accuracy vs consensus"
    }
  ];

  return (
    <section className="bg-black py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              The Culture Speaks
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real feedback from real fans who know ball.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-200 text-lg mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-white font-semibold">{testimonial.author}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-semibold">
                      {testimonial.highlight}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-block bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-white mb-2">Join 47,000+ Fans</div>
            <div className="text-gray-300">Who trust The Barbershop for real NBA takes</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
