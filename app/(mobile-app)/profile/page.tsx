import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { MemberCard } from "../../(components)/member-card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ProfileSettings } from "../../(components)/profile-settings"; // Import our client component

export default async function ProfilePage() {
  // 1. Get the Auth User
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // 2. Fetch the Public Profile from Prisma
  // We use findUnique because we know the ID exists (thanks to your sync logic)
  const profile = await prisma.user.findUnique({
    where: { id: authUser?.id },
  });

  // Fallback if something went wrong (shouldn't happen if middleware works)
  if (!profile) return <div>User not found</div>;

  return (
    <div className='min-h-screen bg-white pb-24 dark:bg-slate-950'>
      {/* Header */}
      <div className='sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80'>
        <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
          My ID
        </h1>
        <Button variant='ghost' size='icon' className='text-slate-400'>
          <Settings className='h-5 w-5' />
        </Button>
      </div>

      <div className='p-4'>
        {/* The Digital Card with REAL DATA */}
        <div className='mb-8'>
          <MemberCard
            name={profile.name || "Member"}
            memberId={profile.memberId || "PENDING"} // Handles null case
            tier={profile.tier}
            since={new Date(profile.createdAt).getFullYear().toString()}
          />
        </div>

        {/* Client Component handles the interactivity */}
        <ProfileSettings />

        {/* Version Info */}
        <div className='text-center'>
          <p className='text-[10px] text-slate-400'>The Union Hub v1.0.3</p>
        </div>
      </div>
    </div>
  );
}
