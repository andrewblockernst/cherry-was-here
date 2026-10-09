export type Visibility = 'public' | 'private'

export interface User {
  id: number
  email: string
  slug: string | null
  name: string | null
  bio: string | null
  avatar_url: string | null
}

export interface PublicUser {
  slug: string
  name: string | null
  bio: string | null
  avatar_url: string | null
}

export interface PublicUserSummary extends PublicUser {
  country_count: number
  moment_count: number
  last_moment_at: string | null
}

export interface Era {
  id: number
  title: string
  slug: string
  start_year: number
  end_year: number | null
  color: string | null
  emoji: string | null
  order_index: number | null
}

export interface Moment {
  id: number
  title: string
  body: string | null
  date: string
  location: string | null
  country_code: string | null
  visibility: Visibility
  latitude: number | null
  longitude: number | null
  photo_url: string | null
  era_id: number | null
  color: string | null
}

export interface EraWithMoments extends Era {
  moments: Moment[]
}

export interface Country {
  iso2: string
  iso3: string
  name: string
  name_es: string | null
  region: string | null
}

export type CountryCounts = Record<string, number>

export interface Profile {
  user: PublicUser
  eras: EraWithMoments[]
  country_counts: CountryCounts
}
