import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  layout("routes/_public.tsx", [
    index("routes/_public._index.tsx"),
    route("pricing", "routes/_public.pricing.tsx"),
    route("about", "routes/_public.about.tsx"),
    route("contact", "routes/_public.contact.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  route("order", "routes/order.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  ...prefix("api/auth", [
    route("request-otp", "routes/api.auth.request-otp.ts"),
    route("verify-otp", "routes/api.auth.verify-otp.ts"),
  ]),
  ...prefix("admin", [
    route("login", "routes/admin.login.tsx"),
    layout("routes/_admin.tsx", [
      index("routes/_admin._index.tsx"),
      route("orders", "routes/_admin.orders.tsx"),
      route("users", "routes/_admin.users.tsx"),
      route("pricing", "routes/_admin.pricing.tsx"),
      route("settings", "routes/_admin.settings.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
