import type { ReactNode } from "react";

type IllustratedMessageProps = {
  image: string;
  imageAlt?: string;
  title: string;
  message: string;
  children?: ReactNode;
  className?: string;
};

function IllustratedMessage({
  image,
  imageAlt = "",
  title,
  message,
  children,
  className = "",
}: IllustratedMessageProps) {
  return (
    <div
      className={`flex flex-col items-center px-4 py-8 text-center ${className}`.trim()}
    >
      <img src={image} alt={imageAlt} className="mb-5 w-40 max-w-full" />

      <h3 className="text-xl font-bold">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 opacity-70">{message}</p>

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export default IllustratedMessage;
