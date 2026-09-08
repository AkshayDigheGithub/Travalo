import { NextResponse, type NextRequest } from "next/server";

import { CURRENCY_COOKIE, currencyForCountry } from "@/config/currencies";

/**
 * Seeds the currency preference from where the visitor is.
 *
 * Prices, and the partner page a booking link opens, follow the currency
 * preference. Without this, everyone starts on the same default wherever they
 * are. It only ever fills in a missing preference: once a visitor has chosen a
 * currency themselves, that choice is left alone.
 *
 * A cookie is used rather than reading the country while rendering, so pages
 * stay statically rendered and the client picks the preference up on its first
 * render, exactly as it does for a currency the visitor chose.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (request.cookies.has(CURRENCY_COOKIE)) return response;

  // Set by Vercel's edge network; absent locally, where the default applies.
  const country = request.headers.get("x-vercel-ip-country");
  response.cookies.set({
    name: CURRENCY_COOKIE,
    value: currencyForCountry(country),
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Pages only: the APIs take their currency from the request, and static
  // assets have nothing to do with it.
  matcher: ["/((?!api|go|_next/static|_next/image|.*\\.[a-z0-9]+$).*)"],
};
