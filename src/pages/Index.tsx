
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
      
      {/* Auth link */}
      <div className="fixed top-4 right-4 z-50">
        <Link to="/auth">
          <Button variant="outline">Sign In</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
