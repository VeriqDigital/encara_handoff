import Container from "@/components/ui/Container";
import { Arrow } from "@/components/ui/Icons";

export default function Closing() {
  return (
    <section className="closing" aria-labelledby="closing-heading">
      <Container>
        <p className="label">Become comfortable with not knowing exactly how it will turn out.</p>
        <h2 id="closing-heading">Start the thing you keep talking about.</h2>
        <a href="#piece" className="text-link">Explore the piece <Arrow /></a>
        <p className="closing-wordmark" aria-hidden="true">ENCARA</p>
      </Container>
    </section>
  );
}
