import React, { useState } from 'react';
import {
  Shield,
  Bus,
  Plus,
  Trash2,
  Edit2,
  Users,
  Route,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
} from 'lucide-react';
import { BusRoute } from '../types/bus';
import { useAuth } from '../context/AuthContext';

interface AdminPortalProps {
  buses: BusRoute[];
  onAddBus: (newBus: BusRoute) => void;
  onUpdateBus: (bus: BusRoute) => void;
  onDeleteBus: (busId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  buses,
  onAddBus,
  onUpdateBus,
  onDeleteBus,
}) => {
  const { userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);

  // Form State
  const [busNumber, setBusNumber] = useState('');
  const [routeName, setRouteName] = useState('');
  const [shift, setShift] = useState('Evening Dispersal');
  const [departureTime, setDepartureTime] = useState('04:45 PM (Jain Bay 1)');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+91 ');
  const [totalSeats, setTotalSeats] = useState(40);
  const [availableSeats, setAvailableSeats] = useState(40);
  const [stopsString, setStopsString] = useState('Jain Global Campus, Banashankari, Jayanagar');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingBusId(null);
    setBusNumber(`KA-01-JU-${100 + buses.length + 1}`);
    setRouteName(`Route ${String.fromCharCode(65 + buses.length)}`);
    setShift('Evening Dispersal');
    setDepartureTime('04:45 PM (Jain Bay ' + (buses.length + 1) + ')');
    setDriverName('New Driver');
    setDriverPhone('+91 98450 00000');
    setTotalSeats(40);
    setAvailableSeats(40);
    setStopsString('Jain Global Campus, Electronic City, Silk Board');
    setDescription('Jain University Transit corridor');
    setIsEditing(true);
  };

  const handleOpenEdit = (bus: BusRoute) => {
    setEditingBusId(bus.id);
    setBusNumber(bus.busNumber);
    setRouteName(bus.routeName);
    setShift(bus.shift);
    setDepartureTime(bus.departureTime);
    setDriverName(bus.driverName);
    setDriverPhone(bus.driverPhone);
    setTotalSeats(bus.totalSeats);
    setAvailableSeats(bus.availableSeats);
    setStopsString(bus.stops.join(', '));
    setDescription(bus.description || '');
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedStops = stopsString
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (editingBusId) {
      // Update
      const existing = buses.find((b) => b.id === editingBusId);
      if (existing) {
        onUpdateBus({
          ...existing,
          busNumber,
          routeName,
          shift,
          departureTime,
          driverName,
          driverPhone,
          totalSeats: Number(totalSeats),
          availableSeats: Number(availableSeats),
          stops: parsedStops,
          description,
        });
      }
    } else {
      // Add new bus
      const newBus: BusRoute = {
        id: `bus-${Date.now()}`,
        busNumber,
        routeName,
        shift,
        departureTime,
        driverName,
        driverPhone,
        totalSeats: Number(totalSeats),
        availableSeats: Number(availableSeats),
        stops: parsedStops,
        campus: 'Jain Global Campus',
        description,
        status: 'scheduled',
        currentStop: parsedStops[0] || 'Jain Campus',
      };
      onAddBus(newBus);
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-400/30 flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded-sm bg-purple-950/80 border border-purple-800">
                  Fleet Administrator
                </span>
                <span className="text-xs text-slate-300">Jain Transport Authority</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Transport Operations & Fleet Control
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Logged in as <strong>{userProfile?.displayName || 'Administrator'}</strong> • Authorized to add routes, assign drivers, and manage bus allocations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Campus Bus</span>
          </button>
        </div>
      </div>

      {/* Editor Modal / Drawer */}
      {isEditing && (
        <div className="bg-white rounded-2xl border-2 border-purple-300 p-6 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">
              {editingBusId ? 'Edit Vehicle Route & Driver Details' : 'Register New College Bus Route'}
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bus Number (Vehicle Reg)</label>
              <input
                type="text"
                required
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Route Identifier</label>
              <input
                type="text"
                required
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Departure Schedule & Bay</label>
              <input
                type="text"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Driver In-Charge Name</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Driver Phone Number</label>
              <input
                type="text"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Seats</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={80}
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Available Seats</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={totalSeats}
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="font-bold text-slate-700 block mb-1">
                Stops Sequence (comma-separated, beginning with College)
              </label>
              <input
                type="text"
                required
                value={stopsString}
                onChange={(e) => setStopsString(e.target.value)}
                placeholder="Jain Global Campus, JP Nagar, Jayanagar, Banashankari"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Vehicle Route</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fleet Vehicles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Active Fleet Inventory</h3>
            <p className="text-xs text-slate-500">Manage all registered Jain University buses and driver assignments</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            {buses.length} Coaches Operational
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Bus Registration</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Assigned Driver</th>
                <th className="px-5 py-3">Stops</th>
                <th className="px-5 py-3 text-center">Seat Capacity</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-slate-900">
                    {bus.busNumber}
                    <span className="block text-[11px] font-sans text-slate-400 font-normal">
                      {bus.departureTime}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-purple-700">
                    {bus.routeName}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <span className="font-semibold text-slate-800">{bus.driverName}</span>
                    <span className="block text-slate-400 font-mono">{bus.driverPhone}</span>
                  </td>
                  <td className="px-5 py-4 text-xs max-w-xs truncate text-slate-600">
                    {bus.stops.join(' → ')}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold text-slate-900">{bus.availableSeats}</span>
                    <span className="text-slate-400 text-xs"> / {bus.totalSeats} free</span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(bus)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Bus"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {buses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteBus(bus.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Bus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
