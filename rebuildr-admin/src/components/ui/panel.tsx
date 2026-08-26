import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type PanelProps = PropsWithChildren<{
  className?: string;
  padding?: "md" | "lg";
}>;

/**
 * The surface every dashboard block sits on. Replaces the card class string
 * that used to be copy-pasted across the statistics components.
 */
const Panel = ({ children, className, padding = "lg" }: PanelProps) => (
  <div
    className={twMerge(
      "rounded-lg border border-gray-200 bg-white",
      padding === "lg" ? "p-6" : "p-4",
      className,
    )}
  >
    {children}
  </div>
);

export default Panel;
