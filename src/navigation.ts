import type { IconName } from './components/ui/Icon'

export type ScreenId =
  | 'home'
  | 'buddy'
  | 'camera'
  | 'family'
  | 'photos'
  | 'memory'
  | 'clock-weather'
  | 'routines'
  | 'privacy'
  | 'developer'
  | 'expressions'

export interface NavItem {
  id: ScreenId
  label: string
  icon: IconName
  group: string
  badge?: string
  mobileLabel?: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'dashboard', group: 'Main', mobileLabel: 'Home' },
  { id: 'buddy', label: 'Buddy', icon: 'personality', group: 'Main', mobileLabel: 'Buddy' },
  { id: 'camera', label: 'Camera', icon: 'camera', group: 'Main', mobileLabel: 'Camera' },
  { id: 'family', label: 'Family', icon: 'family', group: 'People', mobileLabel: 'Family' },
  { id: 'photos', label: 'Photos', icon: 'photos', group: 'People', mobileLabel: 'Photos' },
  { id: 'memory', label: 'Memory', icon: 'memory', group: 'People', mobileLabel: 'Memory' },
  { id: 'clock-weather', label: 'Clock & Weather', icon: 'clock', group: 'Display', mobileLabel: 'Clock' },
  { id: 'routines', label: 'Routines', icon: 'routines', group: 'Display', mobileLabel: 'Routines' },
  { id: 'privacy', label: 'Privacy', icon: 'privacy', group: 'Safety', mobileLabel: 'Privacy' },
  { id: 'developer', label: 'Developer', icon: 'developer', group: 'Advanced', badge: 'DEV', mobileLabel: 'Dev' },
]

export const MOBILE_NAV: ScreenId[] = [
  'home', 'buddy', 'camera', 'family', 'developer',
]

export function navItem(id: ScreenId): NavItem | undefined {
  return NAV_ITEMS.find(i => i.id === id)
}
