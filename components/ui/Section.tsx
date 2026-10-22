import Container from "./Container";

type SectionProps = {
  children: React.ReactNode;
  id?: string;
  tone?: "paper" | "light" | "ink";
  className?: string;
};

const Section = ({
  children,
  id,
  tone = "paper",
  className = "",
}: SectionProps) => {
  const toneClasses = {
    paper: "bg-(--paper) text-(--ink)",
    light: "bg-(--surface) text-(--ink)",
    ink: "bg-(--ink) text-(--paper)",
  };

  return (
    <section
      id={id}
      className={`scroll-mt-28 py-16 sm:py-20 lg:py-24 ${toneClasses[tone]} ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
};

export default Section;
