import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// import logo from "~/assets/logo.svg";
import logo from "~/assets/head.svg";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          gap: ".5rem",
        }}
      >
        <img width={48} height={48} src={logo} alt="Loan Wolf Logo" />
        <h1 style={{ fontSize: "1.75rem" }}>LOAN WOLF</h1>
      </div>
      <Outlet />
    </>
  );
}
