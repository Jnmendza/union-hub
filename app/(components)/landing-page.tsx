"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  MessageSquare,
  Users,
  Zap,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroImage =
    "https://firebasestorage.googleapis.com/v0/b/union-hub-live.firebasestorage.app/o/landing%2Fhero3.png?alt=media&token=132bf9c5-b36a-4c69-a029-c2931c126334";

  return (
    <div className='min-h-screen bg-[#050B14] text-white selection:bg-blue-600/50 overflow-x-hidden font-sans'>
      {/* --- STYLES FOR CUSTOM SPORTY ANIMATIONS --- */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#050B14]/90 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"}`}
      >
        <div className='max-w-7xl mx-auto px-6 flex items-center justify-between'>
          <div className='flex items-center gap-1 cursor-pointer'>
            <div className='rounded-lg flex items-center justify-center font-black text-xl text-white'>
              <Logo width={50} height={50} priority />
            </div>
            <span className='hidden sm:inline font-black italic text-2xl tracking-tighter text-white uppercase'>
              Union Hub
            </span>
          </div>
          <div className='flex items-center gap-4 sm:gap-6'>
            <Link
              href='/login'
              className='text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors'
            >
              Log In
            </Link>
            <button
              onClick={() => router.push("/register")}
              className='bg-white text-black px-4 py-2 sm:px-6 sm:py-2.5 rounded-none font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-blue-500 hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer'
            >
              Start Union
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className='relative min-h-[90vh] flex items-center pt-20 pb-20 [clip-path:polygon(0_0,100%_0,100%_85%,0%_100%)]'>
        {/* Background Image (Generated via Gemini) */}
        <div
          className='absolute inset-0 z-0 bg-cover bg-center'
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        {/* Aggressive Gradient Overlays */}
        <div className='absolute inset-0 z-10 bg-gradient-to-r from-[#050B14] via-[#050B14]/80 to-transparent' />
        <div className='absolute inset-0 z-10 bg-gradient-to-t from-[#050B14] via-transparent to-transparent' />
        <div className='absolute inset-0 z-10 bg-blue-900/20 mix-blend-overlay' />

        <div className='relative z-20 max-w-7xl mx-auto px-6 w-full mt-12'>
          <div className='max-w-3xl'>
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-widest mb-6 border-l-4 border-white animate-in fade-in slide-in-from-left-8 duration-500'>
              <Flame size={14} className='animate-pulse' /> The 2026 Beta is
              Live
            </div>

            <h1 className='text-6xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100'>
              Rule The <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600'>
                Terrace.
              </span>
            </h1>

            <p className='text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200'>
              Ditch the chaotic WhatsApp groups. Build a digital clubhouse with
              secure chat, verified member IDs, and a matchday command center.
            </p>

            <div className='flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300'>
              <button
                onClick={() => router.push("/register")}
                className='w-full sm:w-auto px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 group transition-all'
              >
                Claim Your Workspace
                <ArrowRight
                  size={20}
                  className='group-hover:translate-x-2 transition-transform'
                />
              </button>
              <Link
                href='#features'
                className='w-full sm:w-auto px-8 py-5 bg-transparent border-2 border-white/20 hover:border-white text-white font-bold uppercase tracking-widest text-sm transition-all text-center'
              >
                View Playbook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- MARQUEE DIVIDER --- */}
      <div className='w-full bg-blue-600 py-4 overflow-hidden -rotate-1 transform origin-left -mt-10 relative z-30 border-y-4 border-black'>
        <div className='flex w-max animate-marquee text-black font-black uppercase tracking-widest text-xl opacity-80'>
          <span className='pr-8 whitespace-nowrap'>
            BUILT FOR THE STANDS • VERIFIED MEMBERS ONLY • NO RIVAL INFILTRATION
            • REAL-TIME MATCHDAY UPDATES • BUILT FOR THE STANDS • VERIFIED
            MEMBERS ONLY • NO RIVAL INFILTRATION • REAL-TIME MATCHDAY UPDATES •
          </span>
          {/* Duplicate for seamless loop */}
          <span className='pr-8 whitespace-nowrap'>
            BUILT FOR THE STANDS • VERIFIED MEMBERS ONLY • NO RIVAL INFILTRATION
            • REAL-TIME MATCHDAY UPDATES • BUILT FOR THE STANDS • VERIFIED
            MEMBERS ONLY • NO RIVAL INFILTRATION • REAL-TIME MATCHDAY UPDATES •
          </span>
        </div>
      </div>

      {/* --- DYNAMIC APP SCREENSHOTS --- */}
      <section className='py-32 relative overflow-hidden bg-[#050B14]'>
        <div className='max-w-7xl mx-auto px-6 relative z-10'>
          <div className='text-center mb-20'>
            <h2 className='text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4'>
              The Matchday <span className='text-blue-500'>Arsenal</span>.
            </h2>
            <p className='text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto'>
              Built to handle the noise of 90 minutes.
            </p>
          </div>

          <div className='flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 perspective-[1000px]'>
            {/* Screenshot 1: Left */}
            <div className='w-full max-w-[320px] aspect-[9/19] bg-gradient-to-br from-slate-800 to-black rounded-3xl p-2 border border-slate-700 transform lg:rotate-y-12 lg:-translate-x-12 hover:rotate-y-0 hover:translate-x-0 transition-all duration-500 shadow-2xl group relative z-10'>
              <div className='w-full h-full bg-[#0a0f1a] rounded-[1.2rem] overflow-hidden relative border border-white/10'>
                <Image
                  src='https://firebasestorage.googleapis.com/v0/b/union-hub-live.firebasestorage.app/o/landing%2Fchat.png?alt=media&token=4aa681de-79fd-4245-8349-9d1825dbccc6'
                  alt='Chat UI'
                  fill
                  className='object-cover'
                />
              </div>
            </div>

            {/* Screenshot 2: Center (Hero) */}
            <div className='w-full max-w-[360px] aspect-[9/19] bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl p-2 border border-blue-400 transform hover:-translate-y-4 transition-all duration-500 shadow-[0_0_50px_rgba(37,99,235,0.3)] group relative z-20'>
              <div className='absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-black uppercase tracking-widest px-4 py-1 border-2 border-black z-10'>
                Command Center
              </div>
              <div className='w-full h-full bg-[#050B14] rounded-[1.2rem] overflow-hidden relative border border-blue-500/30'>
                <Image
                  src='https://firebasestorage.googleapis.com/v0/b/union-hub-live.firebasestorage.app/o/landing%2Fhome.png?alt=media&token=6febc6f9-d68d-4760-9f4c-59e7248eb784'
                  alt='Home UI'
                  fill
                  className='object-cover'
                />
              </div>
            </div>

            {/* Screenshot 3: Right */}
            <div className='w-full max-w-[320px] aspect-[9/19] bg-gradient-to-bl from-slate-800 to-black rounded-3xl p-2 border border-slate-700 transform lg:-rotate-y-12 lg:translate-x-12 hover:rotate-y-0 hover:translate-x-0 transition-all duration-500 shadow-2xl group relative z-10'>
              <div className='w-full h-full bg-[#0a0f1a] rounded-[1.2rem] overflow-hidden relative border border-white/10'>
                <Image
                  src='https://firebasestorage.googleapis.com/v0/b/union-hub-live.firebasestorage.app/o/landing%2Fid.png?alt=media&token=a9175a44-cd1e-4ee0-a075-f51f4ddaf951'
                  alt='ID UI'
                  fill
                  className='object-cover'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AGGRESSIVE FEATURES GRID --- */}
      <section
        id='features'
        className='py-24 bg-[#08101C] border-t border-white/5 [clip-path:polygon(0_15%,100%_0,100%_100%,0%_100%)] pt-40'
      >
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Feature 1 */}
            <div className='bg-[#050B14] border-l-4 border-blue-500 p-8 hover:bg-slate-900 transition-colors group'>
              <Shield className='text-blue-500 w-12 h-12 mb-6 group-hover:scale-110 transition-transform' />
              <h3 className='text-2xl font-black uppercase tracking-tight mb-3'>
                Lock Down The Culture
              </h3>
              <p className='text-slate-400 font-medium'>
                Enterprise-grade security meets the terraces. Issue digital
                membership cards with QR codes to gatekeep tailgates and private
                chats. No rivals allowed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className='bg-[#050B14] border-l-4 border-white p-8 hover:bg-slate-900 transition-colors group'>
              <Zap className='text-white w-12 h-12 mb-6 group-hover:scale-110 transition-transform' />
              <h3 className='text-2xl font-black uppercase tracking-tight mb-3'>
                Cut Through The Noise
              </h3>
              <p className='text-slate-400 font-medium'>
                When the march starts, people need to know. Pin urgent
                announcements to the top of everyone&apos;s feed with push
                notifications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className='bg-[#050B14] border-l-4 border-slate-600 p-8 hover:bg-slate-900 transition-colors group'>
              <MessageSquare className='text-slate-400 w-12 h-12 mb-6 group-hover:text-white transition-colors' />
              <h3 className='text-2xl font-black uppercase tracking-tight mb-3'>
                Segment The Squad
              </h3>
              <p className='text-slate-400 font-medium'>
                Keep the drumline chatter out of the main feed. Create
                dedicated, role-based chat channels for leadership, capos, and
                general members.
              </p>
            </div>

            {/* Feature 4 */}
            <div className='bg-[#050B14] border-l-4 border-blue-500 p-8 hover:bg-slate-900 transition-colors group'>
              <Users className='text-blue-500 w-12 h-12 mb-6 group-hover:scale-110 transition-transform' />
              <h3 className='text-2xl font-black uppercase tracking-tight mb-3'>
                The Digital Vault
              </h3>
              <p className='text-slate-400 font-medium'>
                Stop asking &quot;does anyone have the chant sheet?&quot; Store
                bylaws, songs, and matchday PDFs in a centralized, read-only
                vault for all members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER / FINAL CTA --- */}
      <section className='py-24 relative overflow-hidden'>
        {/* Massive background text */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-5 pointer-events-none select-none'>
          <h1 className='text-[15vw] font-black uppercase tracking-tighter whitespace-nowrap'>
            UNION HUB
          </h1>
        </div>

        <div className='max-w-4xl mx-auto px-6 text-center relative z-10'>
          <h2 className='text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 text-white'>
            Ready For <span className='text-blue-600'>Kickoff?</span>
          </h2>
          <p className='text-xl text-slate-400 mb-10 font-medium'>
            Join the beta today. Claim your union&apos;s namespace for the
            upcoming season.
          </p>

          <div className='flex flex-col sm:flex-row justify-center gap-6'>
            <button
              onClick={() => router.push("/register")}
              className='bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 font-black uppercase tracking-widest text-lg transition-transform transform hover:-translate-y-1 cursor-pointer'
            >
              Start Free Workspace
            </button>
            <a
              href='mailto:contact@jonathanmendoza.dev'
              className='bg-transparent border-2 border-slate-700 hover:border-white text-white px-10 py-5 font-bold uppercase tracking-widest transition-colors flex items-center justify-center'
            >
              Contact Developer
            </a>
          </div>
        </div>

        <div className='text-center mt-32 text-slate-600 text-sm font-bold uppercase tracking-widest'>
          &copy; 2026 Union Hub. Built by the Culture.
        </div>
      </section>
    </div>
  );
}
