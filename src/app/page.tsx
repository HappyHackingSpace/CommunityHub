import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Welcome to Community Hub
      </h1>
      <p className="text-lg mb-8 text-gray-700">
        There is nothing much right now, but sit tight! Amazing things are going
        to happen!
      </p>
    <Button>Hello</Button>
    </main>
  );
}
