"use client";

import { useState } from "react";
import { Navbar } from "@/shared/components/Navbar";
import Header from "./Header";
import { useHeader } from "../contexts/HeaderContext";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import { Toaster } from "sonner";

export default function Layout({ children }) {
  useSessionTimeout();
  const [collapsed, setCollapsed] = useState(false);
  const { headerConfig } = useHeader();

  return (
    <>
      <Navbar collapsed={collapsed} />

      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-72"
        }`}
      >
        <Header
          onToggleMenu={() => setCollapsed(!collapsed)}
          {...headerConfig}
        />
        <Toaster position="top-right" richColors closeButton />
        <div className="p-2 bg-gray-50 min-h-screen">{children}</div>
      </main>
    </>
  );
}
