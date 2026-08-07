import { useEffect, useRef, useState } from 'react'
import {
  AR,
  BO,
  BR,
  CL,
  CO,
  DE,
  ES,
  FR,
  GB,
  IT,
  MX,
  PE,
  PY,
  US,
  UY,
} from 'country-flag-icons/react/3x2'
import { cn } from '@/shared/lib/cn'
import { Field, fieldControlClasses } from '@/shared/ui/Field'
import type { PhoneCountryCodeOption } from '../mocks/shipments.mocks'
import styles from './PhoneCountryCodeSelect.module.css'

/**
 * Sólo los países que la maqueta usa (ver `PHONE_COUNTRY_CODES`), importados
 * por nombre — no `import * as` — para que el bundler pueda hacer tree
 * shaking del resto de las ~250 banderas del paquete.
 */
/** Todos los componentes de bandera comparten el mismo tipo interno del paquete. */
const FLAG_COMPONENTS: Record<string, typeof AR> = {
  AR,
  BR,
  CL,
  UY,
  PY,
  BO,
  PE,
  CO,
  MX,
  US,
  ES,
  FR,
  IT,
  DE,
  GB,
}

export interface PhoneCountryCodeSelectProps {
  readonly id: string
  readonly label: string
  readonly options: readonly PhoneCountryCodeOption[]
  /** Código telefónico elegido (`option.dialCode`), o `''` si no hay selección. */
  readonly value: string
  readonly onChange: (dialCode: string) => void
  readonly className?: string
}

function Flag({ isoCode }: { readonly isoCode: string }) {
  const FlagComponent = FLAG_COMPONENTS[isoCode]
  if (FlagComponent === undefined) return null
  return <FlagComponent className={styles.flag} aria-hidden="true" />
}

/** Mismo chevron que `Select` (ver Select.module.css), como ícono propio para poder rotarlo. */
function Chevron({ open }: { readonly open: boolean }) {
  return (
    <svg
      className={cn(styles.chevron, open && styles.chevronOpen)}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
    </svg>
  )
}

/**
 * Selector de código telefónico de país, con bandera (Figma 7956:15869 /
 * 10465:14551). No es un `<select>` nativo porque un `<option>` no puede
 * llevar una imagen adentro — es un listbox a medida, con las banderas de
 * `country-flag-icons` (SVG reales, no el emoji: en Windows los glifos de
 * bandera no existen y el navegador cae al fallback de texto).
 *
 * Cerrado muestra sólo bandera + código (los nombres de país son demasiado
 * largos para el campo ya elegido); la lista abierta muestra bandera + país
 * + código.
 */
export function PhoneCountryCodeSelect({ id, label, options, value, onChange, className }: PhoneCountryCodeSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.dialCode === value)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <Field id={id} label={label} className={className} floatLabel labelActive={open}>
      <div ref={rootRef} className={styles.root}>
        <button
          type="button"
          id={id}
          className={cn(fieldControlClasses.control, styles.trigger)}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {selected !== undefined ? (
            <span className={styles.triggerValue}>
              <Flag isoCode={selected.isoCode} />
              {selected.dialCode}
            </span>
          ) : (
            <span className={styles.placeholder}>-</span>
          )}
        </button>

        <Chevron open={open} />

        {open && (
          <ul className={styles.listbox} role="listbox" aria-label={label}>
            {options.map((option) => (
              <li key={option.isoCode} role="option" aria-selected={option.dialCode === value}>
                <button
                  type="button"
                  className={cn(styles.option, option.dialCode === value && styles.optionSelected)}
                  onClick={() => {
                    onChange(option.dialCode)
                    setOpen(false)
                  }}
                >
                  <Flag isoCode={option.isoCode} />
                  <span className={styles.optionText}>
                    {option.countryName} {option.dialCode}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  )
}
