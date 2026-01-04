"use client"

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function Button({children, onClick , className, type} : ButtonProps) {
  return ( <>
     <button type={type} className={className} onClick={onClick || (() => {})}>{children}</button>
  </>
)};
