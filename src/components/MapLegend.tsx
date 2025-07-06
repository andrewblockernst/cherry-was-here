import React from "react";
import { MapPin } from "lucide-react";

interface MapLegendProps {
  show: boolean;
  visitedCount: number;
  totalCountries: number;
}

const MapLegend: React.FC<MapLegendProps> = ({
  show,
  visitedCount,
  totalCountries,
}) => {
  if (!show) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
        Leyenda del Mapa
      </h3>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
          <span className="text-sm text-gray-700">Países no visitados</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <span className="text-sm text-gray-700">Países visitados</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
          <span className="text-sm text-gray-700">País seleccionado</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-400 rounded-sm"></div>
          <span className="text-sm text-gray-700">Hover sobre país</span>
        </div>
      </div>

      <hr className="my-3" />

      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Visitados:</span>
          <span className="font-medium">{visitedCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Total mundial:</span>
          <span className="font-medium">{totalCountries}</span>
        </div>
        <div className="flex justify-between">
          <span>Restantes:</span>
          <span className="font-medium">{totalCountries - visitedCount}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <p>
          💡 Tip: Haz clic en cualquier país para agregarlo a tu lista de
          visitados
        </p>
      </div>
    </div>
  );
};

export default MapLegend;
