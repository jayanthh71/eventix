import ProfileButton from "@/components/ui/ProfileButton";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-700/30 bg-gray-900/80 backdrop-blur-md select-none">
      <nav className="flex h-20 max-w-full items-center justify-between px-8 font-extrabold md:mx-12">
        <Link
          href="/"
          className="font-anek transform bg-clip-text text-4xl transition-all duration-300 hover:scale-105"
        >
          Eventix
        </Link>
        <ProfileButton />
      </nav>
    </header>
  );
}
