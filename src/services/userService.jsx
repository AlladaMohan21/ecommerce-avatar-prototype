const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Utility function for making robust API calls with exponential backoff.
 */
const withExponentialBackoff = async (apiCall, maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (i === maxRetries - 1) {
                console.error("API call failed after all retries.", error);
                throw error;
            }
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Fetches the user's profile based on their ID.
 * @param {string} id - The user ID.
 * @returns {object} The user profile data.
 */
export const getUserProfile = async (id) => {
    const url = `${API_BASE_URL}/users/${id}`;
    
    const apiCall = async () => {
        const response = await fetch(url);
        if (response.status === 404) {
             // Return a default profile if the ID isn't found in the simulated database
            return { height: 175, weight: 70, bodyType: 'Mesomorph' };
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const data = result.data;
        return {
            height: data.height || 175,
            weight: data.weight || 70,
            bodyType: data.bodyType || 'Mesomorph',
            id: data.id // Keep the ID from the response
        };
    };
    
    return await withExponentialBackoff(apiCall);
};

/**
 * Updates the user's profile data (height, weight, bodyType).
 * @param {string} id - The user ID.
 * @param {object} profileData - The data to update.
 * @returns {object} The updated user profile.
 */
export const updateProfile = async (id, profileData) => {
    const url = `${API_BASE_URL}/users/${id}`;
    const payload = {
        height: parseFloat(profileData.height),
        weight: parseFloat(profileData.weight),
        bodyType: profileData.bodyType,
    };

    const apiCall = async () => {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result.data;
    };
    
    return await withExponentialBackoff(apiCall);
};
