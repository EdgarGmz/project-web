import ThemeToggle from '../atoms/ThemeToggle'
import Sidebar from '../organisms/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg text-text flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-surface/80 backdrop-blur border-b border-slate-600/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/30"></div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}