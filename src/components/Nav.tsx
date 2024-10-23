"use client"

import { cn } from "@/lib/client/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ComponentProps, ReactNode, CSSProperties } from "react"

interface NavProps {
  children: ReactNode
  style?: CSSProperties 
  className?:string
}

export function Nav({ children, style, className }: NavProps) {
  return (
    <nav
      className="bg-primary text-primary-foreground flex justify-center px-4 fixed w-full top-0 z-10"
      style={style}
    >
      {children}
    </nav>
  )
}

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  className?: string; // Allow className to be passed as a prop
  style?: CSSProperties;
  children: ReactNode;
}

export function NavLink({
  className,
  style,
  children,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      {...props}
      className={cn(
        "p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground",
        pathname === props.href && "bg-background text-foreground",
        className // Apply className prop if provided
      )}
      style={style} // Apply style prop if provided
    >
      {children}
    </Link>
  );
}