// src/components/ui/dialog.jsx
import React from "react";

export function Dialog({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function DialogContent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function DialogHeader({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function DialogTitle({ children, ...props }) {
  return <h2 {...props}>{children}</h2>;
}
