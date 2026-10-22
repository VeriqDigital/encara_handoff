import Image from "next/image";
import Container from "@/components/ui/Container";
import campaignImage from "@/public/images/encara/encara-city-football.jpg";

export default function About() {
  return (
    <section
      id="story"
      className="story-section"
      aria-labelledby="story-heading"
    >
      <figure className="story-campaign">
        <Image
          src={campaignImage}
          alt="Black-and-white photograph of two people playing with a football on a city-street crosswalk."
          sizes="(max-width: 848px) calc(100vw - 48px), 800px"
        />
      </figure>
      <div className="manifesto-panel">
        <Container>
          <div className="manifesto">
            <div className="manifesto-intro">
              <p className="label">Where it begins</p>
              <h2 id="story-heading">
                Some things stay in your head longer than they should.
              </h2>
            </div>
            <div className="manifesto-body">
              <p>
                An idea you keep coming back to. A place you want to reach.
                Something you know you want to do, but keep finding reasons to
                wait. You tell yourself you need more time. More confidence. A
                better moment. That is where ENCARA begins.
              </p>
            </div>
            <div className="manifesto-body">
              <p>
                The name comes from a Spanish word meaning to face, confront, or
                take something on. But ENCARA was never meant to belong to one
                place, one sport, or one type of person.
              </p>
              <p>
                To move toward the things that scare you instead of away from
                them. To trust an idea before you have proof that it will work. To
                accept that failure, doubt, and uncertainty are part of becoming
                who you want to be.
              </p>
            </div>
            <div className="manifesto-body">
              <p>
                Started by three friends from Chicago with the goal to not only be
                intentional with our pieces but to make ENCARA an experience. To
                inspire people to dream and to never conform or put yourself in a
                box. On this journey we hope to implement our love for film,
                fashion, and footy!
              </p>
              <p className="manifesto-welcome">Welcome to ENCARA.</p>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
