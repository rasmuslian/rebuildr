declare module "*.png";
declare module "*.jpeg";
declare module "*.svg";

interface Window {
  gtag: (command: string, ...args: unknown[]) => void;
  dataLayer: unknown[];
  fbq: (command: string, ...args: unknown[]) => void;
}
