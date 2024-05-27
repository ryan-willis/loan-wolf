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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          lineHeight: "1.8",
        }}
      >
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
