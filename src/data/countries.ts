// World countries data for reference
export const WORLD_COUNTRIES = [
  // Europe
  { name: "Spain", iso2: "ES", iso3: "ESP", region: "Europe" },
  { name: "France", iso2: "FR", iso3: "FRA", region: "Europe" },
  { name: "Italy", iso2: "IT", iso3: "ITA", region: "Europe" },
  { name: "Germany", iso2: "DE", iso3: "DEU", region: "Europe" },
  { name: "United Kingdom", iso2: "GB", iso3: "GBR", region: "Europe" },
  { name: "Portugal", iso2: "PT", iso3: "PRT", region: "Europe" },
  { name: "Netherlands", iso2: "NL", iso3: "NLD", region: "Europe" },
  { name: "Belgium", iso2: "BE", iso3: "BEL", region: "Europe" },
  { name: "Switzerland", iso2: "CH", iso3: "CHE", region: "Europe" },
  { name: "Austria", iso2: "AT", iso3: "AUT", region: "Europe" },
  { name: "Sweden", iso2: "SE", iso3: "SWE", region: "Europe" },
  { name: "Norway", iso2: "NO", iso3: "NOR", region: "Europe" },
  { name: "Denmark", iso2: "DK", iso3: "DNK", region: "Europe" },
  { name: "Finland", iso2: "FI", iso3: "FIN", region: "Europe" },
  { name: "Greece", iso2: "GR", iso3: "GRC", region: "Europe" },
  { name: "Poland", iso2: "PL", iso3: "POL", region: "Europe" },
  { name: "Czech Republic", iso2: "CZ", iso3: "CZE", region: "Europe" },
  { name: "Hungary", iso2: "HU", iso3: "HUN", region: "Europe" },
  { name: "Ireland", iso2: "IE", iso3: "IRL", region: "Europe" },
  { name: "Croatia", iso2: "HR", iso3: "HRV", region: "Europe" },

  // South America
  { name: "Argentina", iso2: "AR", iso3: "ARG", region: "South America" },
  { name: "Brazil", iso2: "BR", iso3: "BRA", region: "South America" },
  { name: "Chile", iso2: "CL", iso3: "CHL", region: "South America" },
  { name: "Peru", iso2: "PE", iso3: "PER", region: "South America" },
  { name: "Colombia", iso2: "CO", iso3: "COL", region: "South America" },
  { name: "Venezuela", iso2: "VE", iso3: "VEN", region: "South America" },
  { name: "Ecuador", iso2: "EC", iso3: "ECU", region: "South America" },
  { name: "Bolivia", iso2: "BO", iso3: "BOL", region: "South America" },
  { name: "Paraguay", iso2: "PY", iso3: "PRY", region: "South America" },
  { name: "Uruguay", iso2: "UY", iso3: "URY", region: "South America" },
  { name: "Guyana", iso2: "GY", iso3: "GUY", region: "South America" },
  { name: "Suriname", iso2: "SR", iso3: "SUR", region: "South America" },

  // North America
  { name: "United States", iso2: "US", iso3: "USA", region: "North America" },
  { name: "Canada", iso2: "CA", iso3: "CAN", region: "North America" },
  { name: "Mexico", iso2: "MX", iso3: "MEX", region: "North America" },
  { name: "Guatemala", iso2: "GT", iso3: "GTM", region: "North America" },
  { name: "Costa Rica", iso2: "CR", iso3: "CRI", region: "North America" },
  { name: "Panama", iso2: "PA", iso3: "PAN", region: "North America" },
  { name: "Cuba", iso2: "CU", iso3: "CUB", region: "North America" },

  // Asia
  { name: "China", iso2: "CN", iso3: "CHN", region: "Asia" },
  { name: "Japan", iso2: "JP", iso3: "JPN", region: "Asia" },
  { name: "South Korea", iso2: "KR", iso3: "KOR", region: "Asia" },
  { name: "India", iso2: "IN", iso3: "IND", region: "Asia" },
  { name: "Thailand", iso2: "TH", iso3: "THA", region: "Asia" },
  { name: "Vietnam", iso2: "VN", iso3: "VNM", region: "Asia" },
  { name: "Singapore", iso2: "SG", iso3: "SGP", region: "Asia" },
  { name: "Malaysia", iso2: "MY", iso3: "MYS", region: "Asia" },
  { name: "Indonesia", iso2: "ID", iso3: "IDN", region: "Asia" },
  { name: "Philippines", iso2: "PH", iso3: "PHL", region: "Asia" },
  { name: "Turkey", iso2: "TR", iso3: "TUR", region: "Asia" },
  { name: "Israel", iso2: "IL", iso3: "ISR", region: "Asia" },
  { name: "United Arab Emirates", iso2: "AE", iso3: "ARE", region: "Asia" },
  { name: "Russia", iso2: "RU", iso3: "RUS", region: "Asia" },

  // Africa
  { name: "South Africa", iso2: "ZA", iso3: "ZAF", region: "Africa" },
  { name: "Egypt", iso2: "EG", iso3: "EGY", region: "Africa" },
  { name: "Morocco", iso2: "MA", iso3: "MAR", region: "Africa" },
  { name: "Kenya", iso2: "KE", iso3: "KEN", region: "Africa" },
  { name: "Nigeria", iso2: "NG", iso3: "NGA", region: "Africa" },
  { name: "Ghana", iso2: "GH", iso3: "GHA", region: "Africa" },
  { name: "Tanzania", iso2: "TZ", iso3: "TZA", region: "Africa" },
  { name: "Ethiopia", iso2: "ET", iso3: "ETH", region: "Africa" },

  // Oceania
  { name: "Australia", iso2: "AU", iso3: "AUS", region: "Oceania" },
  { name: "New Zealand", iso2: "NZ", iso3: "NZL", region: "Oceania" },
  { name: "Fiji", iso2: "FJ", iso3: "FJI", region: "Oceania" },
];

// Default colors for different regions
export const REGION_COLORS = {
  Europe: "#3B82F6", // Blue
  "South America": "#10B981", // Green
  "North America": "#F59E0B", // Yellow
  Asia: "#EF4444", // Red
  Africa: "#8B5CF6", // Purple
  Oceania: "#06B6D4", // Cyan
};

// Get country name from ISO code
export function getCountryNameFromCode(code: string): string {
  const country = WORLD_COUNTRIES.find(
    (c) => c.iso2 === code || c.iso3 === code
  );
  return country?.name || code;
}

// Get suggested color based on region
export function getSuggestedColor(countryCode: string): string {
  const country = WORLD_COUNTRIES.find(
    (c) => c.iso2 === countryCode || c.iso3 === countryCode
  );
  return country
    ? REGION_COLORS[country.region as keyof typeof REGION_COLORS]
    : "#10B981";
}
