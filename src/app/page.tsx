import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/nav-link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background">
      {/* Floating Header Bar */}
      <header className="w-full bg-background border-b-4 border-border px-8 py-4 flex items-center justify-center">
        <nav className="w-full max-w-3xl">
          <ul className="flex flex-row gap-24 justify-center">
            <li>
              <NavLink href="#">Features</NavLink>
            </li>
            <li>
              <NavLink href="#">Communities</NavLink>
            </li>
            <li>
              <NavLink href="#">Pricing</NavLink>
            </li>
            <li>
              <NavLink href="#">Resources</NavLink>
            </li>
          </ul>
        </nav>
      </header>

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
