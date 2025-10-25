import React from 'react';

const HomePage = ({ navigate }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-4xl font-extrabold text-indigo-700 mb-4">Welcome to the Virtual Fitting Room</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-lg text-center">
                This prototype demonstrates the connection between the React frontend and your Node.js API.
            </p>
            <button
                onClick={() => navigate('avatar')}
                className="px-8 py-3 bg-indigo-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
                Start Fitting Experience
            </button>
        </div>
    );
};

export default HomePage;
