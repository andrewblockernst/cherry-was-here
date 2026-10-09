import type { Country } from '../../shared/types/cherry'

/** Country list from the API plus an iso2 -> Spanish display name lookup. */
export async function useCountries() {
  const { data } = await useFetch<{ countries: Country[] }>('/api/countries', { key: 'countries' })
  const countries = computed(() => data.value?.countries ?? [])
  const names = computed(() => Object.fromEntries(countries.value.map(c => [c.iso2, c.name_es || c.name])))
  return { countries, names }
}
