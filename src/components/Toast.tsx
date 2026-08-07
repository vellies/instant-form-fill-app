"use client";

import { useEffect } from "react";

const POSITION_CLASSES = {
  "top-right": "top-5 right-5",
  "bottom-right": "bottom-5 right-5",
};

const TYPE_CLASSES = {
  success: "bg-primary-light text-primary-dark",
  error: "bg-danger-light text-danger",
};

export default function Toast({
  message,
  onClose,
  type = "error",
  position = "bottom-right",
}: {
  message: string;
  onClose: () => void;
  type?: "success" | "error";
  position?: "top-right" | "bottom-right";
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed z-50 max-w-sm rounded-[14px] px-4 py-3 text-[13px] font-medium shadow-card ${POSITION_CLASSES[position]} ${TYPE_CLASSES[type]}`}
    >
      {message}
    </div>
  );
}
