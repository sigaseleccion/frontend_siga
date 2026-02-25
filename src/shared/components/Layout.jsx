"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/shared/components/Navbar";
import Header from "./Header";
import { useHeader } from "../contexts/HeaderContext";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import { Toaster } from "sonner";

export default function Layout({ children }) {
  useSessionTimeout();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { headerConfig } = useHeader();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Navbar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          isMobile ? "ml-0" : collapsed ? "ml-20" : "ml-72"
        }`}
      >
        <Header
          onToggleMenu={() =>
            isMobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed)
          }
          {...headerConfig}
        />
        <Toaster position="top-right" richColors closeButton />
        <div className="p-4 bg-gray-50 min-h-[calc(100vh-64px)]">{children}</div>
      </main>
    </>
  );
}