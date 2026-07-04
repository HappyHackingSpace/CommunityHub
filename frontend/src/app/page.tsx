"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/nav-link";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Zap, Shield } from "lucide-react";
import { GlobalHeader } from "@/components/global-header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null; // Prevent flicker
  }

  return (
    <main className="min-h-screen flex flex-col bg-background font-base selection:bg-main selection:text-main-foreground overflow-hidden">
      {/* Navigation */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full"
      >
        <GlobalHeader />
      </motion.div>


      {/* Hero Section */}
      <section className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center px-6 py-20 lg:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block mb-6 px-4 py-1.5 bg-yellow-300 border-2 border-border rounded-full font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-2"
        >
          🚀 The new era of communities is here
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black font-heading leading-tight md:leading-[1.1] text-foreground mb-6"
        >
          Build the ultimate <br />
          <span className="text-main underline decoration-4 underline-offset-8">space</span> for your tribe.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-lg md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-10 h-20"
        >
          <TypingAnimation
            words={[
              "Engage with your fans.",
              "Host powerful events.",
              "Monetize your knowledge.",
              "Grow together.",
            ]}
            typeSpeed={50}
            deleteSpeed={30}
            as="span"
            loop={true}
            className="font-medium"
          />
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.7 }}
           className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
        >
          {session ? (
            <a href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-xl font-black bg-chart-4 text-black hover:bg-chart-4/90 border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 group transition-transform active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                Go to Dashboard
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 flex-shrink-0 transition-transform" />
              </Button>
            </a>
          ) : (
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 px-8 text-xl font-black bg-chart-4 text-black hover:bg-chart-4/90 border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 group transition-transform active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => {
                sessionStorage.setItem("authRedirect", "/discover");
                window.location.href = process.env.NEXT_PUBLIC_BACKEND_URL 
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google` 
                  : "http://localhost:3000/auth/google";
              }}
            >
              Get Started Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 flex-shrink-0 transition-transform" />
            </Button>
          )}
          
          <a href="/discover">
            <Button size="lg" variant="neutral" className="w-full sm:w-auto h-14 px-8 text-xl border-4 text-foreground bg-white font-bold flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              Explore Communities
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full bg-main border-t-4 border-border py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black font-heading mb-4 text-black">Everything you need.</h2>
            <p className="text-xl text-black font-medium">Simple, fast, and remarkably powerful.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white p-8">
              <div className="w-14 h-14 bg-chart-1 border-2 border-border rounded-base flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Users className="text-black w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Community First</h3>
              <p className="text-muted-foreground font-medium">
                Create multiple private or public groups, manage members, and keep your audience engaged under one roof.
              </p>
            </Card>

            <Card className="bg-white p-8">
              <div className="w-14 h-14 bg-chart-2 border-2 border-border rounded-base flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                <Zap className="text-black w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground font-medium">
                Built on modern web technologies ensuring your community loads instantly, everywhere.
              </p>
            </Card>

            <Card className="bg-white p-8">
              <div className="w-14 h-14 bg-chart-4 border-2 border-border rounded-base flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-3">
                <Shield className="text-black w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Secure & Private</h3>
              <p className="text-muted-foreground font-medium">
                Robust role-based access control, tenant isolation, and moderation tools built right in.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full bg-background border-t-4 border-border py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black font-heading mb-4 text-black">Simple, transparent pricing.</h2>
            <p className="text-xl text-black font-medium">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-white p-8 border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
              <h3 className="text-3xl font-black mb-2">Starter</h3>
              <p className="text-muted-foreground font-medium mb-6">Perfect for small groups and testing.</p>
              <div className="mb-8">
                <span className="text-5xl font-black">$0</span>
                <span className="text-muted-foreground font-medium">/ forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-chart-4 flex items-center justify-center border-2 border-border text-black text-sm">✓</div>
                  Up to 100 members
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-chart-4 flex items-center justify-center border-2 border-border text-black text-sm">✓</div>
                  1 Community
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-chart-4 flex items-center justify-center border-2 border-border text-black text-sm">✓</div>
                  Basic Moderation
                </li>
              </ul>
              <Button size="lg" className="w-full text-lg border-2" variant="neutral">Get Started Free</Button>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-chart-2 p-8 border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col relative hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-black text-white px-4 py-1 rounded-full text-sm font-bold border-2 border-border">
                MOST POPULAR
              </div>
              <h3 className="text-3xl font-black mb-2 text-black">Creator Pro</h3>
              <p className="text-black/80 font-medium mb-6">For growing communities and businesses.</p>
              <div className="mb-8 text-black">
                <span className="text-5xl font-black">$29</span>
                <span className="text-black/80 font-medium">/ month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-black">
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 border-border text-black text-sm">✓</div>
                  Unlimited members
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 border-border text-black text-sm">✓</div>
                  Unlimited Communities
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 border-border text-black text-sm">✓</div>
                  Custom Branding
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 border-border text-black text-sm">✓</div>
                  Priority Support
                </li>
              </ul>
              <Button size="lg" className="w-full text-lg border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">Upgrade to Pro</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t-4 border-border bg-white px-6 py-10 text-center font-bold">
        <p className="text-foreground">
          © {new Date().getFullYear()} CommunityHub. Built with <span className="text-chart-3">♥</span> for doers.
        </p>
      </footer>
    </main>
  );
}
