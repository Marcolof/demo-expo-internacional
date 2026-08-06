import { Outlet } from 'react-router-dom'
import { ChatBubble } from '@/shared/layout/ChatBubble'
import { Footer } from '@/shared/layout/Footer'
import { Header } from '@/shared/layout/Header'
import { Sidebar } from '@/shared/layout/Sidebar'
import styles from './AppShell.module.css'

/**
 * Layout de la maqueta: header, sidebar y contenido.
 * Chrome visual sin navegación real.
 */
export function AppShell() {
  return (
    <>
      <Header />
      <Sidebar isDrawerOpen={false} onCloseDrawer={() => undefined} />

      <div className={styles.shell}>
        <div className={styles.main}>
          <Outlet />
        </div>
        <Footer />
      </div>

      <ChatBubble />
    </>
  )
}
