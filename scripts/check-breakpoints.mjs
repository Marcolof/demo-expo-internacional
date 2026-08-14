#!/usr/bin/env node
/**
 * Valida que los @media del proyecto usen breakpoints canónicos
 * alineados a tokens (--bp-*) y VIEWPORTS oficiales:
 *   Mobile 360 | Tablet 768 | Desktop 1366
 *   (+ max .98: 767.98 | 1365.98)
 *
 * Exit 1 si hay anchos fuera de allowlist (salvo ALLOW_LEGACY → WARN).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

const CANONICAL = new Set([360, 768, 1366, 767.98, 1365.98])

/** Deuda documentada (baseline): WARN hasta migrar en la próxima iteración. */
const ALLOW_LEGACY = new Set([
  'src/shared/layout/Header.module.css',
  'src/shared/layout/Footer.module.css',
  'src/shared/layout/PageHeader.module.css',
  'src/shared/ui/Modal/Modal.module.css',
  'src/modules/account/forms/AddressForm.module.css',
  'src/modules/account/forms/UserForm.module.css',
  'src/modules/shipments/forms/ShipmentForm.module.css',
  'src/modules/shipments/pages/CheckoutPage.module.css',
  'src/modules/shipments/pages/NewShipmentPage.module.css',
])

const MEDIA_RE = /@media[^{]+/g
const WIDTH_RE = /\((?:min|max)-width:\s*([0-9]+(?:\.[0-9]+)?)px\)/g

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (name.endsWith('.css')) out.push(p)
  }
  return out
}

const errors = []
const warnings = []

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  const text = readFileSync(file, 'utf8')
  const blocks = text.match(MEDIA_RE) ?? []

  for (const block of blocks) {
    if (block.includes('prefers-')) continue

    WIDTH_RE.lastIndex = 0
    let m
    while ((m = WIDTH_RE.exec(block)) !== null) {
      const value = Number(m[1])
      if (CANONICAL.has(value)) continue

      const entry = { file: rel, value }
      if (ALLOW_LEGACY.has(rel)) warnings.push(entry)
      else errors.push(entry)
    }
  }
}

function printGroup(title, items) {
  if (items.length === 0) return
  console.log(`\n${title} (${items.length})`)
  for (const i of items) {
    console.log(`  ${i.file}  →  ${i.value}px`)
  }
}

console.log('check:breakpoints — viewports oficiales 360 / 768 / 1366')
printGroup('ERROR — breakpoint no canónico', errors)
printGroup('WARN — legacy permitido (migrar)', warnings)

if (errors.length > 0) {
  console.log('\nPermitidos: 360 | 768 | 1366 | 767.98 | 1365.98')
  console.log('Ver: src/styles/tokens.css · src/shared/lib/breakpoints.ts')
  process.exit(1)
}

console.log(warnings.length === 0 ? '\nOK — sin desviaciones.' : '\nOK — sólo warnings legacy.')
process.exit(0)
