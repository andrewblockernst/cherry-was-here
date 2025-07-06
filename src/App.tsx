import { useState, useCallback } from "react";
import { Plus, Globe } from "lucide-react";
import WorldMap from "./components/WorldMap";
import AddCountryModal from "./components/AddCountryModal";
import VisitedCountriesList from "./components/VisitedCountriesList";
import StatsCard from "./components/StatsCard";
import { useCountries } from "./hooks/useCountries";
import type { Country } from "./types";
import "./styles/App.css";

function App() {
  const {
    countries,
    visitedCount,
    totalCountries,
    completionPercentage,
    addCountry,
    removeCountry,
    getCountryByGeoId,
  } = useCountries();

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountryName, setSelectedCountryName] = useState("");

  const handleCountryClick = useCallback(
    (countryId: string) => {
      setSelectedCountry(countryId);
      // Try to get the country name from existing data or use the ID
      const existingCountry = getCountryByGeoId(countryId);
      setSelectedCountryName(existingCountry?.name || countryId);
      setIsModalOpen(true);
    },
    [getCountryByGeoId]
  );

  const handleSaveCountry = useCallback(
    (newCountry: Omit<Country, "id">) => {
      const countryData = {
        ...newCountry,
        iso2: selectedCountry,
        iso3: selectedCountry,
      };

      addCountry(countryData);
      setIsModalOpen(false);
      setSelectedCountry("");
    },
    [selectedCountry, addCountry]
  );

  const handleDeleteCountry = useCallback(
    (countryId: string) => {
      if (window.confirm("¿Estás seguro de que quieres eliminar este país?")) {
        removeCountry(countryId);
      }
    },
    [removeCountry]
  );

  const handleSelectCountry = useCallback((countryId: string) => {
    setSelectedCountry(countryId);
  }, []);

  const handleAddCountry = useCallback(() => {
    setSelectedCountry("");
    setSelectedCountryName("");
    setIsModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Globe className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                Cherry Was Here
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{visitedCount}</span> de{" "}
                {totalCountries} países visitados
              </div>
              <button
                onClick={handleAddCountry}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar País</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                <WorldMap
                  countries={countries}
                  onCountryClick={handleCountryClick}
                  selectedCountry={selectedCountry}
                  visitedCount={visitedCount}
                  totalCountries={totalCountries}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <VisitedCountriesList
              countries={countries}
              onDeleteCountry={handleDeleteCountry}
              onSelectCountry={handleSelectCountry}
            />

            {/* Stats */}
            <StatsCard
              countries={countries}
              visitedCount={visitedCount}
              completionPercentage={completionPercentage}
            />
          </div>
        </div>
      </main>

      {/* Modal */}
      <AddCountryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCountry}
        selectedCountryId={selectedCountry}
        selectedCountryName={selectedCountryName}
      />
    </div>
  );
}

export default App;
