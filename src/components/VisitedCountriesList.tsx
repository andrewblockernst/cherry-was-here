import React from "react";
import { MapPin, Calendar, Palette, Trash2 } from "lucide-react";
import type { Country } from "../types";

interface VisitedCountriesListProps {
  countries: Country[];
  onDeleteCountry: (countryId: string) => void;
  onSelectCountry: (countryId: string) => void;
}

const VisitedCountriesList: React.FC<VisitedCountriesListProps> = ({
  countries,
  onDeleteCountry,
  onSelectCountry,
}) => {
  const visitedCountries = countries.filter((country) => country.visited);

  if (visitedCountries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Aún no has agregado países visitados</p>
        <p className="text-sm">Haz clic en el mapa para empezar</p>
      </div>
    );
  }

  const sortedCountries = [...visitedCountries].sort((a, b) => {
    if (a.visitedYear && b.visitedYear) {
      return b.visitedYear - a.visitedYear;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Países Visitados ({visitedCountries.length})
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {sortedCountries.map((country) => (
          <div
            key={country.id}
            className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onSelectCountry(country.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: country.color }}
                />
                <div>
                  <h4 className="font-medium text-gray-900">{country.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {country.visitedYear && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{country.visitedYear}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Palette className="w-3 h-3" />
                      <span>{country.color}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCountry(country.id);
                }}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
                title="Eliminar país"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitedCountriesList;
