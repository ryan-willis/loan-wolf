import { Outlet } from "@remix-run/react";

export default function LoansRoute() {
  return (
    <div>
      <h1>Loans</h1>
      <Outlet />
    </div>
  );
}
