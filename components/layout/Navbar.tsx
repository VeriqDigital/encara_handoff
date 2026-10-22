import Link from "next/link";
import { navigation } from "@/config/navigation";

export default function Navbar() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/home" aria-label="ENCARA home">ENCARA</Link>
      <nav aria-label="Main navigation">
        {navigation.map(({ label, href }) => <a key={href} href={href}>{label}</a>)}
      </nav>
    </header>
  );
}
