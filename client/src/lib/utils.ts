import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Yeh function conditional CSS classes ko aasaani se jodne mein madad karta hai
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
