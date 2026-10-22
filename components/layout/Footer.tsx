import Link from "next/link";
import { footerLinks } from "@/config/navigation";

export default function Footer() {
  return (
    <footer className="site-footer">
      <Link href="/home" className="wordmark" aria-label="ENCARA home">ENCARA</Link>
      <p className="label">Film / Fashion / Footy</p>
      <nav aria-label="Footer navigation">
        {footerLinks.map(({ label, href }) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <p className="footer-credit">
        <a href="https://veriqdigital.com">Website by Veriq</a>
      </p>
    </footer>
  );
}
