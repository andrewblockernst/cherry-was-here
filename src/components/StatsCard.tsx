import React from "react";
import { TrendingUp, Award } from "lucide-react";
import type { Country } from "../types";

interface StatsCardProps {
  countries: Country[];
  visitedCount: number;
  completionPercentage: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  countries,
  visitedCount,
  completionPercentage,
}) => {
  const visitedCountries = countries.filter((c) => c.visited);

  // Calculate years statistics
  const years = visitedCountries
    .map((c) => c.visitedYear)
    .filter((year): year is number => year !== undefined);

  const uniqueYears = [...new Set(years)];
  const earliestYear = years.length > 0 ? Math.min(...years) : null;
  const latestYear = years.length > 0 ? Math.max(...years) : null;

  // Calculate this year's visits
  const currentYear = new Date().getFullYear();
  const thisYearVisits = visitedCountries.filter(
    (c) => c.visitedYear === currentYear
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
        Estadísticas de Viaje
      </h3>

      <div className="space-y-4">
        {/* Main Progress */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total visitados:</span>
            <span className="font-medium">{visitedCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Progreso mundial:</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Years Statistics */}
        {uniqueYears.length > 0 && (
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Años activos:</span>
                <span className="font-medium">{uniqueYears.length}</span>
              </div>

              {earliestYear && latestYear && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-medium">
                    {earliestYear === latestYear
                      ? earliestYear
                      : `${earliestYear} - ${latestYear}`}
                  </span>
                </div>
              )}

              {thisYearVisits > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Este año:</span>
                  <span className="font-medium">{thisYearVisits} países</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Award className="w-4 h-4 mr-2 text-yellow-500" />
            Logros
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            {visitedCount >= 1 && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Primer viaje registrado
              </div>
            )}
            {visitedCount >= 5 && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Explorador novato (5+ países)
              </div>
            )}
            {visitedCount >= 10 && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Viajero experimentado (10+ países)
              </div>
            )}
            {visitedCount >= 25 && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                Trotamundos (25+ países)
              </div>
            )}
            {visitedCount >= 50 && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                Explorador mundial (50+ países)
              </div>
            )}
            {completionPercentage >= 50 && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gold-400 rounded-full mr-2"></span>
                Mitad del mundo completada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
