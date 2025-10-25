import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import AvatarPage from './pages/AvatarPage';

// Simple Router (no react-router-dom needed for this prototype)
const App = () => {
    const [currentPage, setCurrentPage] = useState('home');

    const navigate = (page) => setCurrentPage(page);

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage navigate={navigate} />;
            case 'avatar':
                return <AvatarPage />;
            default:
                return <HomePage navigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-indigo-900">Virtual Fit Room 👕</h1>
                    {currentPage !== 'home' && (
                        <button
                            onClick={() => navigate('home')}
                            className="text-indigo-600 hover:text-indigo-800 transition duration-150 font-medium"
                        >
                            ← Home
                        </button>
                    )}
                </header>

                {renderPage()}
            </div>
        </div>
    );
};

export default App;
