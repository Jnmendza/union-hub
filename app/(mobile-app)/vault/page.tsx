import { VaultBrowser } from '@/app/(components)/vault-browser'
import { prisma } from '@/lib/prisma'

export default async function VaultPage() {
  // 1. Fetch Real Data from Database
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-6 dark:bg-slate-950">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">The Vault</h1>
        <p className="text-sm text-slate-500">Official documents & media library.</p>
      </div>

      {/* 2. Pass Data to Client Component */}
      <VaultBrowser initialResources={resources} />

    </div>
  )
}