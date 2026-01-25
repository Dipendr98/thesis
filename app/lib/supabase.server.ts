import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

/**
 * Creates a Supabase server client that uses the user's session from request cookies.
 * This client respects RLS policies since it's authenticated as the user.
 *
 * @param request - The incoming request with auth cookies
 * @returns Object containing the supabase client and response headers
 */
export function getSupabaseServerClient(request: Request) {
  const headers = new Headers();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const parsed = parseCookieHeader(request.headers.get("Cookie") ?? "");
          // Filter out cookies with undefined values and ensure proper typing
          return parsed
            .filter((cookie): cookie is { name: string; value: string } => cookie.value !== undefined);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append("Set-Cookie", serializeCookieHeader(name, value, options))
          );
        },
      },
    }
  );

  return { supabase, headers };
}

/**
 * Gets the authenticated user from the request.
 * Returns null if no valid session exists.
 */
export async function getAuthenticatedUser(request: Request) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
