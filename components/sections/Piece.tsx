import Image from "next/image";
import Container from "@/components/ui/Container";
import { Arrow } from "@/components/ui/Icons";
import frontImage from "@/public/images/encara/encara-studio-front.jpg";
import detailImage from "@/public/images/encara/encara-studio-looking-left.jpg";
import { piece } from "@/data/product";

export default function Piece() {
  return (
    <section id="piece" className="piece-section" aria-labelledby="piece-heading">
      <Container>
        <div className="section-line"><p className="label">ENCARA / {piece.name}</p><p className="label">{piece.availability}</p></div>
        <div className="piece-grid">
          <figure className="piece-main-photo">
            <Image src={frontImage} alt="Front view of a black ENCARA top with football artwork and the words ‘It all starts with a dream’." sizes="(max-width: 700px) calc(100vw - 40px), 52vw" quality={90} />
            <figcaption className="label">It all starts with a dream</figcaption>
          </figure>
          <div className="piece-side">
            <figure className="piece-detail-photo">
              <Image src={detailImage} alt="Alternate studio view of the black ENCARA top and its football graphic." sizes="(max-width: 700px) calc(100vw - 40px), 30vw" />
            </figure>
            <div className="piece-info">
              <div className="piece-title"><h2 id="piece-heading">{piece.name}</h2><p className="piece-price">{piece.price}</p></div>
              <p className="label">{piece.availability}</p>
              <p className="piece-note">{piece.presaleNote}</p>
              <p className="piece-sizes">Available sizes: {piece.sizes.map((size) => size.label).join(" / ")}</p>
              <details className="size-guide">
                <summary>Size guide <span className="size-guide-marker" aria-hidden="true" /></summary>
                <div className="size-guide-content">
                  <table aria-describedby="piece-measurement-note">
                    <caption>Garment measurements ({piece.measurementUnit})</caption>
                    <thead>
                      <tr>
                        <th scope="col">Measurement</th>
                        {piece.sizes.map((size) => <th scope="col" key={size.label}>{size.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {piece.measurements.map((measurement) => (
                        <tr key={measurement.label}>
                          <th scope="row">{measurement.label}</th>
                          {piece.sizes.map((size) => <td key={size.label}>{measurement.values[size.label]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p id="piece-measurement-note" className="size-guide-note">{piece.measurementNote}</p>
                </div>
              </details>
              <a className="text-link" href="#story">Read the story <Arrow /></a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
