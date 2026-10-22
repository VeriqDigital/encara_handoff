import Button from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Icons";
import HeroMedia from "@/components/sections/HeroMedia";

export default function Hero() {
  return (
    <section className="campaign" aria-labelledby="campaign-heading">
      <div className="campaign-copy">
        <div className="campaign-message">
          <p className="label campaign-label">Film / Fashion / Footy</p>
          <h1 id="campaign-heading">There will always be a reason to wait.</h1>
          <div className="campaign-bottom">
            <p>ENCARA is the reason not to.</p>
            <Button href="#piece" variant="light">
              Explore the piece <Arrow />
            </Button>
          </div>
        </div>
      </div>
      <figure className="campaign-photo">
        <HeroMedia />
      </figure>
    </section>
  );
}
