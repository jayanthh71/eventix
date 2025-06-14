export default async function TrainPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return (
    <main className="flex min-h-[calc(100vh-5rem)] justify-center px-4 sm:px-6">
      {id}
    </main>
  );
}
