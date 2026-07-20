"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type IModalRef, Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";

interface DialogLogoutProps {
  dialogRef?: React.RefObject<IModalRef | null>;
  onLogout?: () => void;
}

export default function DialogLogout({ dialogRef, onLogout }: DialogLogoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/logout", { method: "GET" });
      onLogout?.();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
      dialogRef?.current?.close();
    }
  };

  return (
    <Modal
      ref={dialogRef}
      title="Logout"
      description="Are you sure you want to logout? You will need to login again to access your account."
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => dialogRef?.current?.close()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLogout} disabled={isLoading}>
            {isLoading ? (
              <>
                <Icon icon="mdi:loading" className="mr-2 size-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <Icon icon="mdi:logout" className="mr-2 size-4" />
                Logout
              </>
            )}
          </Button>
        </>
      }
    />
  );
}
