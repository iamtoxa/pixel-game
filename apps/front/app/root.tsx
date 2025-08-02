import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import Providers from "@/components/Providers";
import { useEffect } from "react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Onest:wght@100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const overrideJsonBigIntSerialization = (): void => {
      const originalJSONStringify = JSON.stringify
        
      JSON.stringify = function (value: any, replacer, space: number): string {
        const bigIntReplacer = (_key: string, value: any): any => {
          if (typeof value === 'bigint') {
            return parseInt(value.toString())
          }
          return value
        }
    
        const customReplacer = (key: string, value: any): any => {
          if (Array.isArray(replacer) && !replacer.includes(key) && key !== '') {
            return undefined
          }
    
          const modifiedValue = bigIntReplacer(key, value)
    
          if (typeof replacer === 'function') {
            return replacer(key, modifiedValue)
          }
        
          return modifiedValue
        }
      
        return originalJSONStringify(value, replacer != null ? customReplacer : bigIntReplacer, space)
      }
    }

    overrideJsonBigIntSerialization()
  }, [])

  useEffect(() => {
    (window as any).printEnv = () => {
      console.log('runtimeEnviroment', runtimeEnviroment)
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
