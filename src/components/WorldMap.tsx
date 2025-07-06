import React, { useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import type { Country } from "../types";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  countries: Country[];
  onCountryClick: (countryId: string) => void;
  selectedCountry?: string;
  visitedCount?: number;
  totalCountries?: number;
}

const WorldMap: React.FC<WorldMapProps> = ({
  countries,
  onCountryClick,
  selectedCountry,
  visitedCount = 0,
  totalCountries = 195,
}) => {
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  const getCountryColor = useCallback(
    (geoId: string) => {
      const country = countries.find(
        (c) => c.iso3 === geoId || c.iso2 === geoId
      );

      if (selectedCountry === geoId) {
        return "#3B82F6"; // blue-500
      }

      if (country?.visited) {
        return country.color || "#10B981"; // emerald-500
      }

      return "#6B7280"; // gray-500 (default unvisited color)
    },
    [countries, selectedCountry]
  );

  const getCountryInfo = useCallback(
    (geoId: string) => {
      return countries.find((c) => c.iso3 === geoId || c.iso2 === geoId);
    },
    [countries]
  );

  const handleMouseEnter = useCallback(
    (geo: any, event: React.MouseEvent) => {
      const country = getCountryInfo(geo.id);
      const countryName = geo.properties.NAME || geo.properties.name;

      let tooltip = countryName;
      if (country?.visited && country.visitedYear) {
        tooltip += ` (Visitado en ${country.visitedYear})`;
      }

      setTooltipContent(tooltip);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    },
    [getCountryInfo]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltipContent("");
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.5, 8));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.5, 1));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setCenter([0, 0]);
  }, []);

  const handleToggleInfo = useCallback(() => {
    setShowInfo((prev) => !prev);
  }, []);

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projectionConfig={{
          scale: 100 * zoom,
          center: center,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup zoom={zoom} center={center}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getCountryColor(geo.id)}
                  stroke="#1F2937"
                  strokeWidth={0.5}
                  style={{
                    default: {
                      outline: "none",
                    },
                    hover: {
                      fill: "#F59E0B",
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#3B82F6",
                      outline: "none",
                    },
                  }}
                  onClick={() => onCountryClick(geo.id)}
                  onMouseEnter={(event) => handleMouseEnter(geo, event)}
                  onMouseLeave={handleMouseLeave}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        showInfo={showInfo}
        onToggleInfo={handleToggleInfo}
      />

      {/* Map Legend */}
      <MapLegend
        show={showInfo}
        visitedCount={visitedCount}
        totalCountries={totalCountries}
      />

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed bg-gray-800 text-white px-2 py-1 rounded shadow-lg pointer-events-none z-10 text-sm"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 30,
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
