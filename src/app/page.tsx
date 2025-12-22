import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background">
      {/* Floating Header Bar */}
      <header className="fixed top-6 left-1/2 z-40 -translate-x-1/2 w-[98vw] max-w-3xl rounded-xl bg-background border-2 border-border px-10 py-3 flex items-center justify-center shadow-shadow">
        <nav>
          <ul className="flex gap-4">
            <li>
              <a
                href="#"
                className="border-2 border-border rounded-lg px-3 py-1 transition-colors hover:bg-main/20"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#"
                className="border-2 border-border rounded-lg px-3 py-1 transition-colors hover:bg-main/20"
              >
                Communities
              </a>
            </li>
            <li>
              <a
                href="#"
                className="border-2 border-border rounded-lg px-3 py-1 transition-colors hover:bg-main/20"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#"
                className="border-2 border-border rounded-lg px-3 py-1 transition-colors hover:bg-main/20"
              >
                Resources
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Spacer for floating header */}
      <div className="h-[90px]" />

      {/* Hero Section */}
      <section className="w-full min-h-[70vh] flex flex-col justify-center items-center px-4 py-14 text-center">
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="text-6xl font-bold text-black mb-4">
            Welcome to Community Hub
          </h1>
          <p className="text-lg sm:text-xl text-black mb-7">
            There is nothing much right now, but sit tight! Amazing things are
            going to happen!
          </p>
          <Button className="px-12 py-6 text-2xl font-bold rounded-xl">
            Discover Communities
          </Button>
        </div>
      </section>
    </main>
  );
}
