import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Country } from "../types";

export function useCountries() {
  const [countries, setCountries] = useLocalStorage<Country[]>(
    "cherry-was-here-countries",
    []
  );

  const addCountry = useCallback(
    (newCountry: Omit<Country, "id">) => {
      const country: Country = {
        ...newCountry,
        id: `${newCountry.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${Date.now()}`,
      };

      setCountries((prev) => {
        const existingIndex = prev.findIndex(
          (c) =>
            c.name.toLowerCase() === country.name.toLowerCase() ||
            c.iso2 === country.iso2 ||
            c.iso3 === country.iso3
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...country };
          return updated;
        }

        return [...prev, country];
      });

      return country;
    },
    [setCountries]
  );

  const removeCountry = useCallback(
    (countryId: string) => {
      setCountries((prev) => prev.filter((c) => c.id !== countryId));
    },
    [setCountries]
  );

  const updateCountry = useCallback(
    (countryId: string, updates: Partial<Country>) => {
      setCountries((prev) =>
        prev.map((c) => (c.id === countryId ? { ...c, ...updates } : c))
      );
    },
    [setCountries]
  );

  const getCountryByGeoId = useCallback(
    (geoId: string) => {
      return countries.find((c) => c.iso2 === geoId || c.iso3 === geoId);
    },
    [countries]
  );

  const visitedCountries = countries.filter((c) => c.visited);
  const visitedCount = visitedCountries.length;
  const totalCountries = 195; // Approximate number of countries in the world
  const completionPercentage = Math.round(
    (visitedCount / totalCountries) * 100
  );

  return {
    countries,
    visitedCountries,
    visitedCount,
    totalCountries,
    completionPercentage,
    addCountry,
    removeCountry,
    updateCountry,
    getCountryByGeoId,
  };
}
