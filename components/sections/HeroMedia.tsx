import Image from "next/image";
import heroImage from "@/public/images/encara/encara-studio-hand-behind-head.jpg";

export default function HeroMedia() {
  // Preserve the original studio portrait for static reduced-motion visits.
  // During normal playback this area reveals the shared viewport background.
  return (
    <Image
      className="campaign-reduced-still"
      src={heroImage}
      alt="ENCARA campaign portrait of a person wearing the black graphic top."
      fill
      sizes="(max-width: 700px) 100vw, 44vw"
      quality={90}
    />
  );
}
