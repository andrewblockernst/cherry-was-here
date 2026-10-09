import type { Country } from '../../shared/types/cherry'

/** Country list from the API plus an iso2 -> Spanish display name lookup (shared by key, fetched once). */
export function useCountries() {
  const { data } = useFetch<{ countries: Country[] }>('/api/countries', { key: 'countries' })
  const countries = computed(() => data.value?.countries ?? [])
  const names = computed(() => Object.fromEntries(countries.value.map(c => [c.iso2, c.name_es || c.name])))
  return { countries, names }
}
