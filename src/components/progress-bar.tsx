"use client";

import { BProgress } from "@bprogress/core";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    BProgress.configure({
      speed: 200,
      trickle: true,
      trickleSpeed: 200,
      showSpinner: false,
      parent: "body",
    });

    const style = document.createElement("style");
    style.textContent = `
            .bar {
                background: #175e86 !important;
                height: 3px !important;
            }
        `;
    document.head.appendChild(style);

    const startProgress = () => {
      BProgress.start();
    };

    const completeProgress = () => {
      BProgress.done();
    };

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a");

      if (
        link &&
        link.href &&
        !link.href.startsWith("javascript:") &&
        !link.href.startsWith("mailto:") &&
        !link.href.startsWith("tel:")
      ) {
        const isInternalLink =
          link.href.startsWith(window.location.origin) || link.href.startsWith("/");

        if (isInternalLink) {
          startProgress();
        }
      }
    };

    document.addEventListener("click", handleLinkClick);

    startProgress();

    const timer = setTimeout(() => {
      completeProgress();
    }, 500);

    return () => {
      clearTimeout(timer);
      completeProgress();
      document.removeEventListener("click", handleLinkClick);
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [pathname, searchParams]);

  return null;
}
