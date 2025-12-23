import * as React from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export function NavLink({ className, children, ...props }: NavLinkProps) {
  return (
    <a className={cn(className)} {...props}>
      {children}
    </a>
  );
}
