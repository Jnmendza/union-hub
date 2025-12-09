
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '../(components)/admin-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Security Check: Ensure user is actually an Admin/Board member
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'BOARD')) {
    // If they aren't admin, kick them back to the mobile app
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}