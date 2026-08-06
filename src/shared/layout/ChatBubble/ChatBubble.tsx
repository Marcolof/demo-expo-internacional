import chatbotIcon from './chatbot.png'
import styles from './ChatBubble.module.css'

/**
 * Réplica visual del botón de chat flotante del HTML de referencia
 * (`#wcx-chat` / `position-fixed bottom-0 end-0`). Es puro chrome: no abre
 * nada, la maqueta no tiene chat real.
 *
 * El asset (`chatbot.png`, 52×52) ya ES el botón circular completo — no hay
 * que dibujarle un círculo de fondo encima, sólo posicionarlo.
 */
export function ChatBubble() {
  return (
    <img src={chatbotIcon} alt="" className={styles.button} aria-hidden="true" />
  )
}
