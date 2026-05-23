import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run i18n middleware on every path EXCEPT:
  //   - API routes, Next/Vercel internals
  //   - static assets (fonts, favicon, sitemap, robots)
  //   - /admin/* — back-office is intentionally NOT localized
  matcher: [
    "/((?!api|_next|_vercel|admin|fonts|audio|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
