import { StreamView } from "@/features/stream-view/stream-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StreamPage({ params }: PageProps) {
  const { id } = await params;
  return <StreamView streamId={id} />;
}
