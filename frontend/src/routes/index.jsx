import { createBrowserRouter, Navigate } from 'react-router-dom'
import { VictimLayout }    from '../layouts/VictimLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { LandingPage }     from '../pages/LandingPage'

// Victim portal pages (redesigned)
import { VictimHome }        from '../pages/victim/VictimHome'
import { SendSOS }           from '../pages/victim/SendSOS'
import { IncidentTracking }  from '../pages/victim/IncidentTracking'
import { RescueChat }        from '../pages/victim/RescueChat'
import { AIAssistant }       from '../pages/victim/AIAssistant'
import { LocationMap }       from '../pages/victim/LocationMap'
import { EmergencyContacts } from '../pages/victim/EmergencyContacts'
import SafetyGuide           from '../pages/victim/SafetyGuide'
import { VictimSettings }    from '../pages/victim/VictimSettings'

// Dashboard portal pages
import { CommandCenter }      from '../pages/dashboard/CommandCenter'
import { IncidentQueue }      from '../pages/dashboard/IncidentQueue'
import { DisasterMap }        from '../pages/dashboard/DisasterMap'
import { RescueTeams }        from '../pages/dashboard/RescueTeams'
import { NetworkMonitor }     from '../pages/dashboard/NetworkMonitor'
import { ResourceManagement } from '../pages/dashboard/ResourceManagement'
import { ReportsAnalytics }   from '../pages/dashboard/ReportsAnalytics'
import { Settings }           from '../pages/dashboard/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },

  // ── Victim Portal ─────────────────────────────────────────
  {
    path: '/victim',
    element: <VictimLayout />,
    children: [
      { index: true,       element: <VictimHome /> },
      { path: 'report',    element: <SendSOS /> },
      { path: 'status',    element: <IncidentTracking /> },
      { path: 'chat',      element: <RescueChat /> },
      { path: 'assistant', element: <AIAssistant /> },
      { path: 'location',  element: <LocationMap /> },
      { path: 'contacts',  element: <EmergencyContacts /> },
      { path: 'guide',     element: <SafetyGuide /> },
      // legacy aliases
      { path: 'sos',      element: <Navigate to="/victim/report" replace /> },
      { path: 'tracking', element: <Navigate to="/victim/status"  replace /> },
    ],
  },

  // ── Command Portal ────────────────────────────────────────
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true,       element: <CommandCenter /> },
      { path: 'incidents', element: <IncidentQueue /> },
      { path: 'map',       element: <DisasterMap /> },
      { path: 'teams',     element: <RescueTeams /> },
      { path: 'resources', element: <ResourceManagement /> },
      { path: 'network',   element: <NetworkMonitor /> },
      { path: 'reports',   element: <ReportsAnalytics /> },
      { path: 'settings',  element: <Settings /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> }
])
