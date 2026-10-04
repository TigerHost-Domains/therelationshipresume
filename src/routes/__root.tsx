import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { CallbackHandler } from '@/components/CallbackHandler'
import { IdentityProvider } from '@/lib/identity-context'

import '../styles.css'

const siteName = 'The Relationship Resume'
const siteDescription =
  'Build a one-page resume for your love life — your qualities, likes, dislikes, dealbreakers and references — and share it with someone worth meeting.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: siteName },
      { name: 'description', content: siteDescription },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400..700&display=swap',
      },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="grain min-h-screen">
        <IdentityProvider>
          <CallbackHandler>{children}</CallbackHandler>
        </IdentityProvider>
        <Scripts />
      </body>
    </html>
  )
}
