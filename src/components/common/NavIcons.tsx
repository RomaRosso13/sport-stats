// Set de iconos de línea para la navegación pública (menú de escritorio +
// drawer móvil) — mismo estilo trazado a mano que ya usan InstallAppButton
// y los íconos de la crónica, para no meter una librería nueva solo por esto.
function IconBase({ children }) {
  return (
    <svg className="nav-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  )
}

export function HomeIcon() {
  return (
    <IconBase>
      <path d="M3 9.5 10 4l7 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8.5V16h4v-4.5h2V16h4V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  )
}

export function CalendarIcon() {
  return (
    <IconBase>
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 3v3.5M13 3v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  )
}

export function FootballIcon() {
  return (
    <IconBase>
      <ellipse cx="10" cy="10" rx="7.5" ry="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 10h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 8.3v3.4M10 7.8v4.4M12 8.3v3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </IconBase>
  )
}

export function TableIcon() {
  return (
    <IconBase>
      <path d="M4 16V11M10 16V6M16 16v-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 16h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconBase>
  )
}

export function TrophyIcon() {
  return (
    <IconBase>
      <path d="M6 3.5h8V7a4 4 0 0 1-8 0V3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 4.5H4a2 2 0 0 0 0 4h1M14 4.5h2a2 2 0 0 1 0 4h-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 11v3M7.5 17h5M8 14h4l.5 3h-5l.5-3Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  )
}

export function StatsIcon() {
  return (
    <IconBase>
      <path d="M3 14.5 7.5 9l3 3L17 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 5h4v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  )
}

export function UsersIcon() {
  return (
    <IconBase>
      <circle cx="7.5" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 17c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14.5" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12.8 17c.1-2.4 1.2-4 3-4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconBase>
  )
}

export function BookIcon() {
  return (
    <IconBase>
      <path d="M10 5.3c-1.5-1-4-1-6-.5v11c2-.5 4.5-.5 6 .5 1.5-1 4-1 6-.5v-11c-2-.5-4.5-.5-6 .5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 5.3v11" stroke="currentColor" strokeWidth="1.4" />
    </IconBase>
  )
}

export function CameraIcon() {
  return (
    <IconBase>
      <path d="M3 8a2 2 0 0 1 2-2h1.3l1-2h5.4l1 2H15a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="11" r="2.8" stroke="currentColor" strokeWidth="1.5" />
    </IconBase>
  )
}

// --- Menú de Administración ---

export function DashboardIcon() {
  return (
    <IconBase>
      <rect x="3" y="3" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
    </IconBase>
  )
}

export function GearIcon() {
  return (
    <IconBase>
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3.5v2M10 14.5v2M16.5 10h-2M5.5 10h-2M14.6 5.4l-1.4 1.4M6.8 13.2l-1.4 1.4M14.6 14.6l-1.4-1.4M6.8 6.8 5.4 5.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconBase>
  )
}

export function LayersIcon() {
  return (
    <IconBase>
      <path d="M10 3 3 7l7 4 7-4-7-4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 10.5 10 14.5 17 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 14 10 18l7-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  )
}

export function ListIcon() {
  return (
    <IconBase>
      <path d="M7.5 5.5h9M7.5 10h9M7.5 14.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="3.7" cy="5.5" r="1" fill="currentColor" />
      <circle cx="3.7" cy="10" r="1" fill="currentColor" />
      <circle cx="3.7" cy="14.5" r="1" fill="currentColor" />
    </IconBase>
  )
}

export function EditIcon() {
  return (
    <IconBase>
      <path d="M12.5 4 16 7.5 7 16.5 3.3 17l.5-3.7L12.5 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 5.5 14.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconBase>
  )
}

export function ClipboardCheckIcon() {
  return (
    <IconBase>
      <rect x="4.5" y="4" width="11" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 4V3.3A1.3 1.3 0 0 1 8.8 2h2.4a1.3 1.3 0 0 1 1.3 1.3V4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.2 10.5l1.8 1.8 3.8-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  )
}

export function MapPinIcon() {
  return (
    <IconBase>
      <path d="M10 17.5S4.5 12.4 4.5 8.3a5.5 5.5 0 0 1 11 0c0 4.1-5.5 9.2-5.5 9.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="8.2" r="2" stroke="currentColor" strokeWidth="1.4" />
    </IconBase>
  )
}
