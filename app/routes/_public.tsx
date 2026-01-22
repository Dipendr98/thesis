import { Outlet } from "react-router";
import { PublicHeader } from "~/components/layout/public-header";
import { PublicFooter } from "~/components/layout/public-footer";
import { SupportButton } from "~/components/support-button";

export default function PublicLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <PublicFooter />
      <SupportButton />
    </div>
  );
}
