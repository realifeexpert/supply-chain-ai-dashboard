import React, { useEffect, useState } from "react";
import { getVehicles } from "@/services/api";
import { Map, Truck, Battery, Thermometer, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle, VehicleStatus } from "@/types";

// Vehicle Status Badge Component
const VehicleStatusBadge = ({ status }: { status: VehicleStatus }) => {
  const statusMap: Record<VehicleStatus, string> = {
    "On Route": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    Idle: "bg-zinc-700 text-zinc-300 border border-zinc-600/50",
    "In-Shop": "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full",
        statusMap[status]
      )}
    >
      {status}
    </span>
  );
};

const LogisticsPage: React.FC = () => {
  // useState mein Vehicle[] type add karein
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getVehicles();
        setVehicles(response.data);
        if (response.data.length > 0) {
          setSelectedVehicle(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-6">
      {/* Map Section */}
      <div className="flex-1 bg-zinc-900 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <Map size={64} className="mx-auto" />
          <p className="mt-4">Live Map Integration Area</p>
          <p className="text-sm">Full-screen map for live vehicle tracking</p>
        </div>
      </div>

      {/* Vehicle Info Panel */}
      <div className="w-full md:w-96 bg-zinc-900 rounded-lg shadow-lg p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4">Vehicle Fleet</h2>
        <div className="flex-1 overflow-y-auto -mr-4 pr-4">
          {loading ? (
            <p className="text-zinc-400 text-center mt-8">
              Loading vehicles...
            </p>
          ) : vehicles.length === 0 ? (
            <p className="text-zinc-400 text-center mt-8">No vehicles found.</p>
          ) : (
            vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={cn(
                  "p-4 mb-3 rounded-lg cursor-pointer transition-all border",
                  selectedVehicle?.id === vehicle.id
                    ? "bg-cyan-600/10 border-cyan-500"
                    : "bg-zinc-800/50 border-transparent hover:bg-zinc-800"
                )}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-white">
                    {vehicle.vehicle_number}
                  </p>
                  <VehicleStatusBadge status={vehicle.status} />
                </div>
                <p className="text-sm text-zinc-400">{vehicle.driver_name}</p>
              </div>
            ))
          )}
        </div>
        {selectedVehicle && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <h3 className="font-bold text-lg text-white mb-3">
              {selectedVehicle.vehicle_number} - Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Truck size={16} className="text-cyan-400" />{" "}
                <span className="text-zinc-300">
                  Driver: {selectedVehicle.driver_name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Box size={16} className="text-cyan-400" />{" "}
                <span className="text-zinc-300">
                  Orders: {selectedVehicle.orders_count}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Thermometer size={16} className="text-cyan-400" />{" "}
                <span className="text-zinc-300">
                  Live Temp: {selectedVehicle.live_temp}°C
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Battery size={16} className="text-cyan-400" />{" "}
                <span className="text-zinc-300">
                  Fuel: {selectedVehicle.fuel_level}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsPage;
