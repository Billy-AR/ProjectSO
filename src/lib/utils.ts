// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility untuk menggabungkan class tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function untuk menghasilkan warna acak dengan kontras baik untuk teks
export function getRandomColor(): string {
  // Array warna pastel dengan kontras baik
  const colors = [
    "#FF9AA2", // Light Red
    "#FFB7B2", // Salmon
    "#FFDAC1", // Light Orange
    "#E2F0CB", // Light Green
    "#B5EAD7", // Mint
    "#C7CEEA", // Light Blue
    "#F7D8BA", // Light Peach
    "#DCD3FF", // Light Purple
    "#CADEFC", // Sky Blue
    "#F6FDC3", // Light Yellow
    "#FFCBF2", // Light Pink
    "#D0F4DE", // Pale Green
    "#A9DEF9", // Baby Blue
    "#E4C1F9", // Lavender
    "#FCF6BD", // Pale Yellow
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

// Utility untuk menghasilkan ID jika crypto tidak tersedia
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
