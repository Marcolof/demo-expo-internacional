import type { SelectOption } from '@/core/types/common'

export interface Branch {
  readonly id: string
  readonly name: string
  readonly address: string
  readonly hours: string
}

export const PROVINCE_OPTIONS: readonly SelectOption[] = [
  { value: 'BA', label: 'Buenos Aires' },
  { value: 'CF', label: 'CABA' },
  { value: 'CB', label: 'Córdoba' },
  { value: 'SF', label: 'Santa Fe' },
  { value: 'MZ', label: 'Mendoza' },
  { value: 'TU', label: 'Tucumán' },
  { value: 'SL', label: 'San Luis' },
  { value: 'RN', label: 'Río Negro' },
]

export const BRANCHES_BY_PROVINCE: Readonly<Record<string, readonly Branch[]>> = {
  BA: [
    { id: 'BA-001', name: '9 de Julio',       address: 'Av. BME Mitre 794',               hours: 'LUN A VIE 9:00 A 14:00' },
    { id: 'BA-002', name: 'San Martín',        address: 'Av. San Martín 1240',             hours: 'LUN A VIE 8:00 A 15:00' },
    { id: 'BA-003', name: 'La Plata Centro',   address: 'Calle 7 Nro 1435, La Plata',     hours: 'LUN A VIE 9:00 A 17:00' },
    { id: 'BA-004', name: 'Quilmes',           address: 'Av. H. Yrigoyen 238, Quilmes',    hours: 'LUN A VIE 9:00 A 15:00' },
  ],
  CF: [
    { id: 'CF-001', name: 'Palermo',           address: 'Av. Santa Fe 3150, Palermo',      hours: 'LUN A VIE 9:00 A 18:00' },
    { id: 'CF-002', name: 'Microcentro',       address: 'Florida 429, San Nicolás',        hours: 'LUN A VIE 8:00 A 20:00' },
    { id: 'CF-003', name: 'Belgrano',          address: 'Av. Cabildo 1530, Belgrano',      hours: 'LUN A VIE 9:00 A 17:00' },
  ],
  CB: [
    { id: 'CB-001', name: 'Córdoba Centro',    address: '25 de Mayo 128, Córdoba',         hours: 'LUN A VIE 8:30 A 17:00' },
    { id: 'CB-002', name: 'Villa Carlos Paz',  address: 'San Martín 456, V. Carlos Paz',   hours: 'LUN A VIE 9:00 A 14:00' },
  ],
  SF: [
    { id: 'SF-001', name: 'Rosario Centro',    address: 'San Martín 2089, Rosario',        hours: 'LUN A VIE 9:00 A 18:00' },
    { id: 'SF-002', name: 'Santa Fe Capital',  address: '25 de Mayo 2200, Santa Fe',       hours: 'LUN A VIE 9:00 A 16:00' },
  ],
  MZ: [
    { id: 'MZ-001', name: 'Mendoza Centro',    address: 'Av. San Martín 1143, Mendoza',    hours: 'LUN A VIE 9:00 A 17:00' },
  ],
  TU: [
    { id: 'TU-001', name: 'Tucumán Centro',    address: '24 de Septiembre 365, Tucumán',   hours: 'LUN A VIE 9:00 A 16:00' },
  ],
  SL: [
    { id: 'SL-001', name: 'San Luis Capital',  address: 'Rivadavia 567, San Luis',         hours: 'LUN A VIE 9:00 A 15:00' },
  ],
  RN: [
    { id: 'RN-001', name: 'Bariloche',         address: 'Mitre 45, Bariloche',             hours: 'LUN A VIE 9:00 A 17:00' },
  ],
}

export function getBranchOptions(provinceValue: string): readonly SelectOption[] {
  const branches = BRANCHES_BY_PROVINCE[provinceValue] ?? []
  return branches.map((b) => ({ value: b.id, label: b.name }))
}

export function findBranch(branchId: string): Branch | undefined {
  for (const branches of Object.values(BRANCHES_BY_PROVINCE)) {
    const found = branches.find((b) => b.id === branchId)
    if (found !== undefined) return found
  }
  return undefined
}
