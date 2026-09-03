import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/timetable", label: "Timetable" },
  { href: "/diary", label: "Diary" },
];

export default function NavBar({ name }: { name: string }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl italic text-ink">
          Our Space
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-ink-soft hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-ink-soft">{name}</span>
          <form action="/api/logout" method="post">
            <button type="submit" className="text-ink-soft underline hover:text-ink">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
