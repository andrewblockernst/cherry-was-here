import React from "react";
import { MapPin, Calendar, Palette, Edit, Trash2 } from "lucide-react";
import type { Country } from "../types";

interface CountryDetailCardProps {
  country: Country;
  onEdit: (country: Country) => void;
  onDelete: (countryId: string) => void;
}

const CountryDetailCard: React.FC<CountryDetailCardProps> = ({
  country,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-sm p-6 border-l-4"
      style={{ borderLeftColor: country.color }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-200"
              style={{ backgroundColor: country.color }}
            />
            <h3 className="text-lg font-semibold text-gray-900">
              {country.name}
            </h3>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {country.visitedYear && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Visitado en {country.visitedYear}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>{country.color}</span>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{country.iso2 || country.iso3}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(country)}
            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            title="Editar país"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(country.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Eliminar país"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryDetailCard;
