import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "light";
  href?: string;
  newTab?: boolean;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
};

const Button = ({
  children,
  variant = "primary",
  href,
  newTab,
  type = "button",
  className = "",
  disabled,
}: ButtonProps) => {
  const contents = (
    <span className="inline-flex items-center justify-center gap-5">
      {children}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={`button button-${variant} ${className}`}
      >
        {contents}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`button button-${variant} ${className}`}
    >
      {contents}
    </button>
  );
};

export default Button;
