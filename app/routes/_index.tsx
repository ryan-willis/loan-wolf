import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Loan Wolf" },
    {
      name: "description",
      content: "Track loan payments like you're on the hunt!",
    },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Loan Wolf</h1>
      <a href="/loans/sample-loan">View Sample Loan</a>
      <a href="/loans">Go to Loans</a>
    </div>
  );
}
