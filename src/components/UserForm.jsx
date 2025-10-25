import React from 'react';

const UserForm = ({ form, onFormChange, onSaveProfile, loading, message, userId }) => {
    return (
        <div className="p-4 space-y-4 bg-white rounded-xl shadow-lg border border-indigo-100">
            <h3 className="text-xl font-semibold text-indigo-700">Body Profile Input</h3>
            <p className="text-xs text-gray-500">Updating profile for prototype user ID: **{userId}**</p>
            <div className="space-y-3">
                {/* Height Input */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Height (cm)</span>
                    <input
                        type="number"
                        name="height"
                        value={form.height || ''}
                        onChange={onFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        min="100"
                        max="250"
                        placeholder="e.g., 175"
                    />
                </label>
                {/* Weight Input */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Weight (kg)</span>
                    <input
                        type="number"
                        name="weight"
                        value={form.weight || ''}
                        onChange={onFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        min="30"
                        max="300"
                        placeholder="e.g., 70"
                    />
                </label>
                {/* Body Type Select */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Body Type</span>
                    <select
                        name="bodyType"
                        value={form.bodyType}
                        onChange={onFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
                    >
                        <option value="Ectomorph">Ectomorph (Slim, lean)</option>
                        <option value="Mesomorph">Mesomorph (Muscular, athletic)</option>
                        <option value="Endomorph">Endomorph (Rounder, higher fat storage)</option>
                    </select>
                </label>
            </div>
            <button
                onClick={onSaveProfile}
                disabled={loading}
                className={`w-full py-2 rounded-md font-semibold transition duration-150 ${
                    loading
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                }`}
            >
                {loading ? 'Updating Profile...' : 'Save Profile & Update Avatar'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
                {message}
            </p>
        </div>
    );
};

export default UserForm;
