import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Drop-in replacements for next/navigation that prepend the active locale.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
