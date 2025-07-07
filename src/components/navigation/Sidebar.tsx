import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { 
  Home,
  BookOpen,
  Users,
  PlayCircle,
  FileJson,
  Key,
  ChartBarStacked,
  LineChart,
  BadgePlus,
  LayoutTemplate 
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  
  const navItems = [
    {
      label : 'Dashboard',
      icon : LayoutTemplate ,
      href : '/tools'
    },
    {
      label: 'Configuration',
      icon: Home,
      href: '/tools/dashboard'
    },
    // {
    //   label: 'Personas',
    //   icon: Users,
    //   href: '/tools/personas'
    // },
    {
      label: 'Scenarios',
      icon: BookOpen,
      href: '/tools/test-cases'
    },
    // {
    //   label: 'Agent Rules',
    //   icon: ChartBarStacked,
    //   href: '/tools/agent-rules'
    // },
    {
      label: 'Test Runs',
      icon: PlayCircle,
      href: '/tools/runs'
    },
    //!added by niranjan
    {
      label: 'LLM Config',
      icon: Key,
      href: '/tools/agnetconfigs'
    },
    // {
    //   label: 'Metrics',
    //   icon: LineChart,
    //   href: '/tools/metrics'
    // }
  ]
  
  return (
    <div className="w-64 border-r border-border bg-card shadow-sm h-screen flex flex-col">
      <div className="flex-1 py-2 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button 
                variant="ghost" 
                className={`w-full justify-start rounded-[var(--radius)] ${
                  pathname === item.href ? 'bg-accent text-accent-foreground font-medium' : ''
                }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
