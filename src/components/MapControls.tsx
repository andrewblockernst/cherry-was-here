import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Info } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  showInfo: boolean;
  onToggleInfo: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  showInfo,
  onToggleInfo,
}) => {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-10">
      <div className="flex flex-col space-y-2">
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Acercar"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <button
          onClick={onZoomOut}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Alejar"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <button
          onClick={onResetView}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Centrar vista"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <hr className="border-gray-200" />

        <button
          onClick={onToggleInfo}
          className={`p-2 rounded-md transition-colors ${
            showInfo
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          }`}
          title="Mostrar información"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MapControls;
