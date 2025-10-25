import React from 'react';

const ClothingList = ({ selectedClothes, onToggleClothing, messageSetter, clothingCatalog }) => {
    
    const toggleClothing = (item) => {
        const isSelected = selectedClothes.some(c => c.id === item.id);

        if (isSelected) {
            // Remove the item
            onToggleClothing(selectedClothes.filter(c => c.id !== item.id));
        } else {
            // Check for conflict (only one bottom item, unless it's Outerwear/Top)
            const hasConflict = selectedClothes.some(c => c.type === item.type);
            if (hasConflict && item.type !== 'Outerwear' && item.type !== 'Top') {
                messageSetter(`Cannot wear two items of type: ${item.type}. Remove the existing one first.`);
                return;
            }
            // Add the new item
            onToggleClothing([...selectedClothes, item]);
        }
        messageSetter(''); // Clear messages on successful interaction
    };

    if (clothingCatalog.length === 0) {
        return (
            <div className="p-4 bg-white rounded-xl shadow-lg border border-indigo-100 text-center">
                <p className="text-red-600">Failed to load clothing catalog from API.</p>
                <p className="text-sm text-gray-500 mt-2">Check console for fetch errors and ensure your backend server is running on **http://localhost:5000**.</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 bg-white rounded-xl shadow-lg border border-indigo-100">
            <h3 className="text-xl font-semibold text-indigo-700">Clothing Catalog</h3>
            <p className="text-sm text-gray-500">Click an item to try it on the avatar.</p>
            <div className="grid grid-cols-2 gap-3">
                {clothingCatalog.map(item => {
                    const isSelected = selectedClothes.some(c => c.id === item.id);
                    const itemColor = item.color || '#9CA3AF'; 
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => toggleClothing(item)}
                            className={`p-3 text-center rounded-lg border-2 transition duration-150 transform hover:scale-[1.02] shadow-sm ${
                                isSelected
                                    ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-200'
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                        >
                            {/* Color Placeholder Block */}
                            <div
                                className="w-full h-8 mx-auto rounded-md mb-2 border border-gray-300"
                                style={{ backgroundColor: itemColor }}
                            ></div>
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">({item.type})</p>
                            {isSelected && <span className="text-xs font-bold text-indigo-600">FITTING</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ClothingList;
