"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1F1F1F",
          color: "#fff",
          border: "1px solid #3A3A3A",
          borderRadius: "0.5rem",
          padding: "1rem",
        },
        success: {
          iconTheme: {
            primary: "#30D158",
            secondary: "#1F1F1F",
          },
        },
        error: {
          iconTheme: {
            primary: "#FF453A",
            secondary: "#1F1F1F",
          },
        },
      }}
    />
  );
}
