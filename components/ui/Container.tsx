type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const Container = ({ children, className = "" }: ContainerProps) => (
  <div
    className={`mx-auto w-full max-w-(--container-width) px-5 sm:px-8 lg:px-10 ${className}`}
  >
    {children}
  </div>
);

export default Container;
