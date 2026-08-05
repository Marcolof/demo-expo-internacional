import styles from './Footer.module.css'

/**
 * Pie de página. Los enlaces son inertes: la maqueta no tiene esas pantallas.
 * Se conservan porque forman parte del chrome del portal original.
 */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <small className={styles.copyright}>Copyright</small>

        <div className={styles.links}>
          <button type="button" className={styles.link}>
            Preguntas frecuentes
          </button>
          <span className={styles.separator}>|</span>
          <button type="button" className={styles.link}>
            Términos y condiciones
          </button>
          <span className={styles.separator}>|</span>
          <button type="button" className={styles.link}>
            Botón de baja
          </button>
        </div>
      </div>
    </footer>
  )
}
