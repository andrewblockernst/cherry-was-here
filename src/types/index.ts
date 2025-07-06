export interface Country {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  visited: boolean;
  visitedYear?: number;
  color?: string;
  provinces?: Province[];
}

export interface Province {
  id: string;
  name: string;
  countryId: string;
  visited: boolean;
  visitedYear?: number;
  color?: string;
}

export interface VisitedPlace {
  id: string;
  countryId: string;
  provinceId?: string;
  name: string;
  visitedYear: number;
  color: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapData {
  countries: Country[];
  provinces: Province[];
  visitedPlaces: VisitedPlace[];
}

export interface MapSettings {
  defaultColor: string;
  visitedColor: string;
  selectedColor: string;
  showProvinces: boolean;
  showYears: boolean;
}
