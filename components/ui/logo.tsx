import Image from "next/image";

interface LogoProps {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function Logo({
  width,
  height,
  className,
  priority = false,
}: LogoProps) {
  return (
    <Image
      src='https://firebasestorage.googleapis.com/v0/b/union-hub-live.firebasestorage.app/o/landing%2FUH-transparent.png?alt=media&token=66120a53-a2e2-4d78-8cc7-6e75daa1d864'
      alt='Union Hub Logo'
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
