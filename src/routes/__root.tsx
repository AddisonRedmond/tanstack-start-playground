import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useState } from 'react'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

import type { TRPCRouter } from '#/integrations/trpc/router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'

interface MyRouterContext {
  queryClient: QueryClient

  trpc: TRPCOptionsProxy<TRPCRouter>
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
  errorComponent: RootError,
})

function RootNotFound() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-stone-600">
        The page you requested does not exist.
      </p>
    </main>
  )
}

function RootError({ error }: { error: Error }) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-red-700">Something went wrong</h1>
      <p className="mt-2 text-sm text-stone-700">{error.message}</p>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="fixed left-4 bottom-4 z-50 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-100"
        >
          Menu
        </button>

        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
            isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        <aside
          aria-label="Main navigation"
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-stone-200 bg-white p-5 shadow-xl transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-900">Navigation</p>
            <button
              type="button"
              onClick={closeMenu}
              className="rounded-md border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Close
            </button>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <Link
              to="/"
              onClick={closeMenu}
              className="rounded-md px-3 py-2 text-stone-700 transition hover:bg-stone-100"
              activeProps={{ className: 'rounded-md bg-stone-900 px-3 py-2 text-white' }}
            >
              Home
            </Link>
            <Link
              to="/report"
              onClick={closeMenu}
              className="rounded-md px-3 py-2 text-stone-700 transition hover:bg-stone-100"
              activeProps={{ className: 'rounded-md bg-stone-900 px-3 py-2 text-white' }}
            >
              Reports
            </Link>
          </nav>
        </aside>

        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
