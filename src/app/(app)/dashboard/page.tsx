import { Greeting } from "@/features/dashboard/greeting";
import { PageShortcuts } from "@/features/dashboard/page-shortcuts";
import { InboxPreview } from "@/features/dashboard/inbox-preview";
import { TaskList } from "@/features/dashboard/task-list";

export default function DashboardPage() {
  return (
    <div className="space-y-12 px-12 py-8 max-w-7xl mx-auto w-full">
      <Greeting name="Bryan" taskCount={4} />
      <PageShortcuts />
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <InboxPreview />
        </div>
        <div className="lg:col-span-3">
          <TaskList />
        </div>
      </section>
    </div>
  );
}
