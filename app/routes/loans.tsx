import { MetaFunction, Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Loan Wolf" },
    {
      name: "description",
      content: "Track loan payments like you're on the hunt!",
    },
  ];
};

export default function LoansRoute() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
