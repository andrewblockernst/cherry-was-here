import React, { useState, useEffect } from "react";
import { X, Save, MapPin } from "lucide-react";
import type { Country } from "../types";
import { getCountryNameFromCode, getSuggestedColor } from "../data/countries";

interface AddCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (country: Omit<Country, "id">) => void;
  selectedCountryId?: string;
  selectedCountryName?: string;
}

const AddCountryModal: React.FC<AddCountryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedCountryId,
  selectedCountryName,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    visitedYear: new Date().getFullYear(),
    color: "#10B981",
    notes: "",
  });

  // Update form when country is selected
  useEffect(() => {
    if (selectedCountryId) {
      const countryName = getCountryNameFromCode(selectedCountryId);
      const suggestedColor = getSuggestedColor(selectedCountryId);

      setFormData((prev) => ({
        ...prev,
        name: countryName,
        color: suggestedColor,
      }));
    } else if (selectedCountryName) {
      setFormData((prev) => ({
        ...prev,
        name: selectedCountryName,
      }));
    }
  }, [selectedCountryId, selectedCountryName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Por favor ingresa el nombre del país");
      return;
    }

    onSave({
      name: formData.name,
      iso2: selectedCountryId || "",
      iso3: selectedCountryId || "",
      visited: true,
      visitedYear: formData.visitedYear,
      color: formData.color,
      provinces: [],
    });

    // Reset form
    setFormData({
      name: "",
      visitedYear: new Date().getFullYear(),
      color: "#10B981",
      notes: "",
    });

    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "visitedYear"
          ? parseInt(value) || new Date().getFullYear()
          : value,
    }));
  };

  const handleClose = () => {
    setFormData({
      name: "",
      visitedYear: new Date().getFullYear(),
      color: "#10B981",
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCountryId
                ? "Agregar País Visitado"
                : "Agregar País Manualmente"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre del País
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Argentina"
              required
            />
          </div>

          <div>
            <label
              htmlFor="visitedYear"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Año de Visita
            </label>
            <input
              type="number"
              id="visitedYear"
              name="visitedYear"
              value={formData.visitedYear}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Color en el Mapa
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={handleChange}
                name="color"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#10B981"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedCountryId
                ? "Color sugerido basado en la región"
                : "Elige un color para identificar este país"}
            </p>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Escribe tus recuerdos o notas sobre este país..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCountryModal;
