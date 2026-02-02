import React from 'react';

const RoomForm = ({ existingData, isSuperAdmin }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Room Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-600">City</label>
          <input 
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="e.g. New York"
            name="city"
          />
        </div>
        
        {/* State Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-600">State</label>
          <input 
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="e.g. NY"
            name="state"
          />
        </div>

        {/* Multi-Hotel Selection (Only for SuperAdmin) */}
        {isSuperAdmin && (
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-semibold text-indigo-600">Assign to Hotel</label>
            <select className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
              <option>Select Hotel...</option>
              {/* Map through hotels from API */}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};