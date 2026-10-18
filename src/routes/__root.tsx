import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { GameProvider } from "@/lib/game";
import { TopBar } from "@/components/TopBar";
import { PwaRegistrar } from "@/components/PwaRegistrar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada / Page not found</h2>
        <div className="mt-6">
          <Link to="/" className="btn-3d inline-flex px-4 py-2 text-sm">Inicio / Home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Algo salió mal / Something went wrong</h1>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-3d px-4 py-2 text-sm"
          >
            Reintentar / Retry
          </button>
          <a href="/" className="rounded-xl border-2 border-border px-4 py-2 text-sm">Inicio / Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PERÚ QUEST" },
      { name: "description", content: "Aprende los 24 departamentos del Perú jugando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-full bg-white/95 px-6 py-3 shadow-2xl border border-border/60 backdrop-blur-md transition-all">
      <Link 
        to="/" 
        activeProps={{ className: "text-primary scale-110" }}
        inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
        className="flex flex-col items-center gap-1 text-xs font-bold transition-all"
      >
        <span className="text-2xl">🗺️</span>
        <span>Inicio</span>
      </Link>
      <Link 
        to="/" 
        hash="camino" 
        activeProps={{ className: "text-primary scale-110" }}
        inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
        className="flex flex-col items-center gap-1 text-xs font-bold transition-all"
      >
        <span className="text-2xl">📍</span>
        <span>Explorar</span>
      </Link>
      <Link 
        to="/logros" 
        activeProps={{ className: "text-primary scale-110" }}
        inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
        className="flex flex-col items-center gap-1 text-xs font-bold transition-all"
      >
        <span className="text-2xl">🏆</span>
        <span>Clasif.</span>
      </Link>
      <Link 
        to="/asistente" 
        activeProps={{ className: "text-primary scale-110" }}
        inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
        className="flex flex-col items-center gap-1 text-xs font-bold transition-all"
      >
        <span className="text-2xl">💬</span>
        <span>Chat</span>
      </Link>
      <Link 
        to="/perfil" 
        activeProps={{ className: "text-primary scale-110" }}
        inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
        className="flex flex-col items-center gap-1 text-xs font-bold transition-all"
      >
        <span className="text-2xl">👤</span>
        <span>Perfil</span>
      </Link>
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <TopBar />
        <PwaRegistrar />
        <Outlet />
        <BottomNav />
      </GameProvider>
    </QueryClientProvider>
  );
}
