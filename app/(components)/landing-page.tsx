"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  MessageSquare,
  FolderOpen,
  QrCode,
  ChevronRight,
  Users,
  Lock,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Alata } from "next/font/google";

const alata = Alata({
  subsets: ["latin"],
  weight: "400",
});

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans'>
      {/* --- NAVBAR --- */}
      <nav className='fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {/* Logo */}
            <Image
              src='https://firebasestorage.googleapis.com/v0/b/union-hub-3d772.firebasestorage.app/o/landing%2FUH-transparent.png?alt=media&token=c5c24033-92c0-400d-a562-3918906a7f57'
              alt='Union Hub Logo'
              width={40}
              height={40}
              className='w-10 h-10 object-contain'
            />
            <span
              className={`${alata.className} font-extrabold text-lg tracking-tight text-white uppercase`}
            >
              Union Hub
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <Link
              href='/login'
              className='text-sm font-medium text-slate-400 hover:text-white transition-colors'
            >
              Sign In
            </Link>
            <Link
              href='/register'
              className='bg-white text-slate-950 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-all active:scale-95'
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className='relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto text-center'>
        {/* Glow Effect */}
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none' />

        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
          <span className='relative flex h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500'></span>
          </span>
          v1.0 is now live for beta testing
        </div>

        <h1 className='text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 animate-in fade-in slide-in-from-bottom-8 duration-1000'>
          The Operating System <br className='hidden md:block' />
          for <span className='text-blue-500'>Supporters Groups</span>.
        </h1>

        <p className='text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100'>
          Stop managing your union on WhatsApp and Google Drive. Union Hub
          brings secure chat, verified digital IDs, and a resource vault into
          one powerful app.
        </p>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200'>
          <Link
            href='/register'
            className='w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)]'
          >
            Create Workspace
          </Link>
          <Link
            href='#features'
            className='w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group'
          >
            See Features{" "}
            <ChevronRight
              className='group-hover:translate-x-1 transition-transform'
              size={20}
            />
          </Link>
        </div>
      </section>

      {/* --- APP SCREENSHOTS SECTION --- */}
      <section className='px-6 py-24 bg-gradient-to-b from-[#020617] to-[#0B1120]'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-5xl font-bold mb-4'>
              Built for the matchday experience.
            </h2>
            <p className='text-slate-400 text-lg'>
              Powerful enough for admins, simple enough for the stands.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Screenshot 1: Chat */}
            <div className='bg-slate-900 border border-white/5 rounded-[2rem] p-4 shadow-2xl hover:border-blue-500/30 transition-all duration-500 group'>
              <div className='relative aspect-[9/19] rounded-[1.5rem] overflow-hidden bg-slate-950 border border-slate-800'>
                {/* Fallback Placeholder until real screenshot */}
                <div className='absolute inset-0 flex items-center justify-center bg-slate-900'>
                  <div className='text-center opacity-50'>
                    <MessageSquare
                      size={48}
                      className='mx-auto mb-2 text-blue-500'
                    />
                    <span className='text-sm font-mono text-blue-200'>
                      CHAT_PREVIEW.PNG
                    </span>
                  </div>
                </div>
                {/* Replace this with real screenshot later */}

                <Image
                  src={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/landing%2Fchat.png?alt=media&token=1fa0d472-885b-414f-aa4d-da306bbe2c18`}
                  alt='Chat UI'
                  fill
                  className='object-cover'
                />
                <div className='absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent'></div>
              </div>
              <div className='text-center mt-6 mb-2'>
                <h3 className='text-xl font-bold text-white mb-1'>
                  Organized Chaos
                </h3>
                <p className='text-slate-400 text-sm px-4'>
                  Dedicated channels for leadership, drums, and tifo crews.
                </p>
              </div>
            </div>

            {/* Screenshot 2: Home Feed (Center/Larger) */}
            <div className='bg-slate-900 border border-blue-500/20 rounded-[2rem] p-4 shadow-[0_0_50px_-20px_rgba(37,99,235,0.3)] transform md:-translate-y-12 z-10 relative mt-6'>
              <div className='absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-400 shadow-lg'>
                FAN FAVORITE
              </div>
              <div className='relative aspect-[9/19] rounded-[1.5rem] overflow-hidden bg-slate-950 border border-slate-800'>
                <div className='absolute inset-0 flex items-center justify-center bg-slate-900'>
                  <div className='text-center opacity-50'>
                    <Zap size={48} className='mx-auto mb-2 text-yellow-500' />
                    <span className='text-sm font-mono text-yellow-200'>
                      HOME_FEED.PNG
                    </span>
                  </div>
                </div>
                <Image
                  src={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/landing%2Fhome.jpeg?alt=media&token=93a59859-f0a7-408e-bf11-7cf7d2b682c5`}
                  alt='Home UI'
                  fill
                  className='object-cover'
                />
              </div>
              <div className='text-center mt-6 mb-2'>
                <h3 className='text-xl font-bold text-white mb-1'>
                  Command Center
                </h3>
                <p className='text-slate-400 text-sm px-4'>
                  Urgent announcements and event updates, front and center.
                </p>
              </div>
            </div>

            {/* Screenshot 3: ID Card */}
            <div className='bg-slate-900 border border-white/5 rounded-[2rem] p-4 shadow-2xl hover:border-purple-500/30 transition-all duration-500 group'>
              <div className='relative aspect-[9/19] rounded-[1.5rem] overflow-hidden bg-slate-950 border border-slate-800'>
                <div className='absolute inset-0 flex items-center justify-center bg-slate-900'>
                  <div className='text-center opacity-50'>
                    <QrCode
                      size={48}
                      className='mx-auto mb-2 text-purple-500'
                    />
                    <span className='text-sm font-mono text-purple-200'>
                      DIGITAL_ID.PNG
                    </span>
                  </div>
                </div>
                <Image
                  src={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/landing%2Fid.jpeg?alt=media&token=0707ead4-0a9e-4237-8170-5b399b2990d3`}
                  alt='ID UI'
                  fill
                  className='object-cover'
                />
                <div className='absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent'></div>
              </div>
              <div className='text-center mt-6 mb-2'>
                <h3 className='text-xl font-bold text-white mb-1'>
                  Verified Membership
                </h3>
                <p className='text-slate-400 text-sm px-4'>
                  Digital ID cards with QR verification to gatekeep your events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section id='features' className='px-6 py-24 max-w-7xl mx-auto'>
        <h2 className='text-3xl font-bold text-center mb-16'>
          Everything you need to lead.
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Card 1: Chat (Large) */}
          <div className='md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden group'>
            <div className='absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity'>
              <MessageSquare size={120} />
            </div>
            <div className='relative z-10'>
              <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6'>
                <Users size={24} />
              </div>
              <h3 className='text-2xl font-bold mb-2'>
                Real-Time Chaos Control
              </h3>
              <p className='text-slate-400 max-w-md'>
                Dedicated channels for your leadership, tifo crew, and general
                members. Keep the noise out and the passion in.
              </p>
            </div>
          </div>

          {/* Card 2: Vault */}
          <div className='bg-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors'>
            <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6'>
              <FolderOpen size={24} />
            </div>
            <h3 className='text-xl font-bold mb-2'>The Vault</h3>
            <p className='text-slate-400 text-sm'>
              Store bylaws, chant sheets, and assets in one secure place. No
              more &quot;Can someone resend the PDF?&quot;
            </p>
          </div>

          {/* Card 3: ID */}
          <div className='bg-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors'>
            <div className='w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6'>
              <QrCode size={24} />
            </div>
            <h3 className='text-xl font-bold mb-2'>Digital Membership</h3>
            <p className='text-slate-400 text-sm'>
              Issue verified Digital IDs with QR codes. Prevent infiltration and
              manage dues status instantly.
            </p>
          </div>

          {/* Card 4: Security (Large) */}
          <div className='md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden group'>
            <div className='absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity'>
              <Shield size={120} />
            </div>
            <div className='relative z-10'>
              <div className='w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-6'>
                <Lock size={24} />
              </div>
              <h3 className='text-2xl font-bold mb-2'>
                Enterprise-Grade Security
              </h3>
              <p className='text-slate-400 max-w-md'>
                Your data is isolated. Rivals can&apos;t see your chats,
                members, or plans. Built on Google Firebase security
                infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className='px-6 pb-20'>
        <div className='max-w-4xl mx-auto bg-blue-600 rounded-3xl p-12 text-center relative overflow-hidden'>
          {/* Decorative Circles */}
          <div className='absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2'></div>
          <div className='absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2'></div>

          <h2 className='text-3xl md:text-4xl font-bold mb-6 relative z-10'>
            Ready to organize your Union?
          </h2>
          <p className='text-blue-100 mb-8 max-w-xl mx-auto relative z-10'>
            Join the beta today. It&apos;s free for inaugural supporters groups.
          </p>
          <div className='relative z-10 flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={() => router.push("/register")}
              className='bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors'
            >
              Start Free Workspace
            </button>
            <button className='bg-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors'>
              Contact Sales
            </button>
          </div>
        </div>

        <div className='text-center mt-12 text-slate-600 text-sm'>
          &copy; 2025 Union Hub. Built for the culture.
        </div>
      </section>
    </div>
  );
}
