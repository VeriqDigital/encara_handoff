import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="home-foreground">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
