## routes

Routes structure (TanStack Router). All logic in features, routes only define navigation.

/                           → HomePage
/browser-fingerprints       → BrowserFingerprintsPage
/secret-voicer              → SecretVoicerLayout
  /                         → redirect to /credentials
  /credentials              → SecretVoicerCredentialsPage
  /voices                   → SecretVoicerVoicesPage
  /sync-logs                → SecretVoicerSyncLogsPage
  /settings                 → inline (WIP)

## styles

globals.css — CSS variables and base styles (colors, spacing, typography tokens)

## FILES

**main.tsx**: App entrypoint — creates TanStack Router and renders to #app DOM node