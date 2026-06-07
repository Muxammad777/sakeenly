import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run i18n middleware on every path EXCEPT:
  //   - API routes, Next/Vercel internals
  //   - static assets (fonts, favicon, sitemap, robots)
  //   - /admin/* — back-office is intentionally NOT localized
  matcher: [
    // Skip i18n routing for any file with a typical static-asset extension
    // (.jpg / .png / .svg / .webp / .mp4 …). Without this the next-intl
    // middleware tries to route /hero-mosque.jpg as a localized page and
    // returns a 404 even though the file exists in /public.
    "/((?!api|_next|_vercel|admin|fonts|audio|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico|mp4|mp3|webm|woff2?|ttf)).*)",
  ],
};
