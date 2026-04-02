import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-grow flex flex-col bg-surface min-h-screen min-w-0">
        <Header />
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}
