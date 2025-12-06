export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Mock Stats Cards */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-medium text-slate-500">Total Members</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">3,240</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-medium text-slate-500">Active Drummers</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">24</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-medium text-slate-500">Pending Approvals</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">12</p>
        </div>
      </div>
    </div>
  )
}