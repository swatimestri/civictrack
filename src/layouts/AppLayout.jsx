import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/20 selection:text-primary">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 w-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto w-full h-full pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
