import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import { HeaderScripts, HeaderTags } from "./config";

export const loader = async () => {
  const VITE_HEADER_TAGS = process.env.VITE_HEADER_TAGS || "";
  try {
    const data: HeaderTags = JSON.parse(VITE_HEADER_TAGS);
    return { ...data };
  } catch {
    return { scripts: [] };
  }
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data: HeaderTags = useRouteLoaderData("root")!;
  const theme = createTheme({
    breakpoints: {
      xs: "38em",
      sm: "48em",
      md: "62em",
      lg: "75em",
      xl: "88em",
    },
  });
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
        <ColorSchemeScript defaultColorScheme="dark" />
        <HeaderScripts data={data} />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
    </>
  );
}
