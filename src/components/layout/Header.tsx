import ProfileButton from "@/components/ui/ProfileButton";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-b-gray-700/50 backdrop-blur-sm select-none">
      <nav className="flex h-20 max-w-full items-center justify-between px-8 font-extrabold md:mx-12">
        <button className="font-anek text-4xl">
          <Link href="/">Eventix</Link>
        </button>
        <ProfileButton />
      </nav>
    </header>
  );
}
