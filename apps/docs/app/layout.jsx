import { Layout, Navbar, Footer } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'PEC App Documentation',
}

export default async function RootLayout({ children }) {
  let pageMap = []
  try {
    pageMap = await getPageMap()
  } catch (e) {
    console.error('Failed to get page map', e)
  }
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={<Navbar logo={<b>PEC App Documentation</b>} />}
          footer={<Footer>MIT {new Date().getFullYear()} © PEC App.</Footer>}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/pecapp/pec/tree/main/apps/docs"
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
