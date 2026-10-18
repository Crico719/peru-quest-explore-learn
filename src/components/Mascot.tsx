import { cn } from "@/lib/utils";

type MascotProps = {
  size?: number;
  src?: string;
  alt?: string;
  className?: string;
};

export function Mascot({ size = 48, src, alt = "Mascota", className }: MascotProps) {
  const dim = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn("block object-contain", className)}
        style={dim}
      />
    );
  }

  // Placeholder reutilizable para la mascota 2D que se incorporará luego
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/40",
        className
      )}
      style={{ width: size, height: size }}
      aria-label="Mascota - placeholder"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Mascota</span>
    </div>
  );
}
