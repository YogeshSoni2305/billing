'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Calendar, CalendarDays, CalendarCheck, Box, LogOut, User } from 'lucide-react'
import { logoutUser } from '@/app/actions'

export default function Sidebar() {
  const pathname = usePathname()

  // Hide sidebar on login page
  if (pathname === '/login') return null

  const menuItems = [
    { name: 'New Bill', path: '/', icon: FileText },
    { name: 'Daily Summary', path: '/daily', icon: Calendar },
    { name: 'Monthly Summary', path: '/monthly', icon: CalendarDays },
    { name: 'Yearly Summary', path: '/yearly', icon: CalendarCheck },
    { name: 'Products', path: '/products', icon: Box },
    { name: 'Customers', path: '/customers', icon: FileText },
  ]

  return (
    <div className="w-64 bg-[var(--color-secondary)] border-r border-slate-800 flex flex-col shrink-0 text-white print:hidden">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 bg-[var(--color-primary)] rounded-lg font-bold shadow-md text-slate-900">
          S
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight uppercase">Sagar<br/>Electricals</h1>
        </div>
      </div>

      <nav className="p-4 flex flex-col gap-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                isActive 
                  ? 'bg-white/10 text-[var(--color-primary)] font-semibold border-l-2 border-[var(--color-primary)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium border-l-2 border-transparent'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold">
            <User size={16} />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-white truncate">Admin Staff</p>
            <p className="text-[10px] text-slate-400">Authenticated</p>
          </div>
        </div>
        <button
          onClick={() => logoutUser()}
          title="Sign Out"
          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}

