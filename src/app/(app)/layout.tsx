import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Fab } from "@/components/layout/fab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-grow flex flex-col bg-surface min-h-screen">
        <Header />
        <div className="px-12 py-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <Fab />
    </div>
  );
}
