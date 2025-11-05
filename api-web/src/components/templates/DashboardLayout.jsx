import ThemeToggle from '../atoms/ThemeToggle'
import Sidebar from '../organisms/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg text-text flex">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <header className="bg-surface/80 backdrop-blur border-b border-slate-600/20 px-6 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <section className="flex items-center gap-4">
              <ThemeToggle />
              <figure className="h-8 w-8 rounded-full bg-accent/20 border border-accent/30"></figure>
            </section>
          </nav>
        </header>
        
        <section className="flex-1 p-6">
          {children}
        </section>
      </main>
    </div>
  )
}