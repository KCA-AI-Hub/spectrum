import { Sidebar } from "@/components/admin/layout/sidebar"
import { Header } from "@/components/admin/layout/header"
import { RealTimeProvider } from "@/components/providers/real-time-provider"
import { DashboardSettingsProvider } from "@/components/providers/dashboard-settings-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardSettingsProvider>
      <RealTimeProvider>
        <div className="h-screen flex">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-6 bg-muted/50">
              {children}
            </main>
          </div>
        </div>
      </RealTimeProvider>
    </DashboardSettingsProvider>
  )
}