function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface GreetingProps {
  name: string;
  taskCount: number;
}

export function Greeting({ name, taskCount }: GreetingProps) {
  return (
    <section className="space-y-1">
      <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
        {getGreeting()}, {name}
      </h1>
      <p className="text-on-surface-variant font-medium">
        {formatDate()} — You have {taskCount} task{taskCount !== 1 ? "s" : ""} for today.
      </p>
    </section>
  );
}
