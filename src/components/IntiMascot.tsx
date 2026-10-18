import { cn } from "@/lib/utils";
import happy from "@/assets/inti/inti-happy.png";
import angry from "@/assets/inti/inti-angry.png";
import thinking from "@/assets/inti/inti-thinking.png";
import sad from "@/assets/inti/inti-sad.png";

export type IntiExpression = "happy" | "angry" | "thinking" | "sad";

type IntiMascotProps = {
  expression?: IntiExpression;
  size?: number;
  className?: string;
  alt?: string;
  float?: boolean;
};

const images: Record<IntiExpression, string> = {
  happy,
  angry,
  thinking,
  sad,
};

export function IntiMascot({
  expression = "happy",
  size = 48,
  className,
  alt = "Inti mascota",
  float = false,
}: IntiMascotProps) {
  const src = images[expression];

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "block select-none will-change-transform transition-transform duration-300 ease-out hover:scale-[1.03] motion-safe:hover:scale-[1.03]",
        float && "motion-safe:inti-float",
        className
      )}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
      draggable={false}
    />
  );
}
