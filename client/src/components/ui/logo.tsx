import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div className="flex items-center">
      <div
        className={cn(
          "rounded-md bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold",
          sizeClasses[size],
          className
        )}
      >
        РГИ
      </div>
      <span className="ml-2 text-lg font-semibold text-silver-800">Переоформляшка</span>
    </div>
  );
}
