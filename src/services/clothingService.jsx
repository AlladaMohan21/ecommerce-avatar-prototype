const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches the entire clothing catalog from the backend.
 * @returns {Array} A list of clothing items.
 */
export const getClothingCatalog = async () => {
    const url = `${API_BASE_URL}/clothing`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Error fetching clothing catalog:", error);
        return [];
    }
};
