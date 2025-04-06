import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Logo from "@/components/ui/logo";

const Home = () => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  const features = [
    {
      icon: "📝",
      title: "AI Proposal Writer",
      description: "Create professional, winning proposals in seconds instead of hours."
    },
    {
      icon: "✉️",
      title: "Email Rewriter",
      description: "Rewrite your emails to sound more professional, friendly, or persuasive."
    },
    {
      icon: "💰",
      title: "Pricing Assistant",
      description: "Get data-backed recommendations for freelance project pricing."
    },
    {
      icon: "📄",
      title: "Contract Explainer",
      description: "Understand complex contracts in simple terms to protect your business."
    },
    {
      icon: "🎤",
      title: "Voice-to-Brief",
      description: "Turn voice recordings or notes into professional project briefs."
    },
    {
      icon: "👥",
      title: "Client Onboarding",
      description: "Create professional client onboarding documents that streamline your process."
    }
  ];

  const testimonials = [
    {
      quote: "Lyra saved me hours on writing proposals. I landed a $10K project using a proposal it helped me create in under 5 minutes.",
      author: "Sarah K., Graphic Designer"
    },
    {
      quote: "The contract explainer helped me avoid a terrible client agreement that would have cost me thousands. This tool pays for itself.",
      author: "Michael R., Web Developer"
    },
    {
      quote: "As a non-native English speaker, the email rewriter has been invaluable for my client communications. More professional results, less stress.",
      author: "Elena T., Marketing Consultant"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <Logo size="md" />
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate("/auth?signup=true")} 
                  className="bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]"
                >
                  Sign Up Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              AI-Powered Tools for <span className="text-primary">Successful Freelancers</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Craft winning proposals, professional emails, and perfect pricing in minutes, not hours.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button 
                onClick={() => navigate("/auth?signup=true")} 
                size="lg"
                className="bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] text-lg px-8"
              >
                Get Started Free
              </Button>
              <Button 
                onClick={() => navigate("/pricing")} 
                variant="outline" 
                size="lg"
                className="text-lg"
              >
                View Pricing
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Essential <span className="text-primary">AI Tools</span> for Freelancers
            </h2>
            <p className="text-muted-foreground text-lg">
              Streamline your workflow and elevate your freelance business with our specialized AI assistants.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-background p-6 rounded-xl border border-border relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              What <span className="text-primary">Freelancers</span> Say
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of freelancers who've transformed their workflow with Lyra.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-card p-6 rounded-xl border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <div className="mb-4 text-primary">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="mb-4 italic">{testimonial.quote}</p>
                <p className="text-sm text-muted-foreground font-medium">{testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Elevate Your <span className="text-primary">Freelance Business</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of freelancers who've transformed their workflow with Lyra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/auth?signup=true")} 
                size="lg"
                className="bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] text-lg px-8"
              >
                Start Free Trial
              </Button>
              <Button 
                onClick={() => navigate("/pricing")} 
                variant="outline" 
                size="lg"
              >
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="mb-4">
                <Logo size="sm" />
              </div>
              <p className="text-muted-foreground max-w-xs">
                AI-powered tools designed specifically for freelancers to streamline their workflow.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-medium mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate("/pricing")}>Pricing</Button></li>
                  <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>Login</Button></li>
                  <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth?signup=true")}>Sign Up</Button></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Features</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" className="p-0 h-auto">Proposal Writer</Button></li>
                  <li><Button variant="link" className="p-0 h-auto">Email Rewriter</Button></li>
                  <li><Button variant="link" className="p-0 h-auto">Contract Explainer</Button></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" className="p-0 h-auto">Privacy Policy</Button></li>
                  <li><Button variant="link" className="p-0 h-auto">Terms of Service</Button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Lyra. All rights reserved. Powered by Arqx.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;