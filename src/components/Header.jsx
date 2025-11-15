import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-green-700 to-green-900 text-white shadow-lg">
      <div className="container mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold text-center">
          PETRONAS Corporate Intelligence Hub
        </h1>
        <p className="text-center text-green-100 mt-2 text-sm">
          Unified Security & Background Verification Platform
        </p>
      </div>
    </header>
  );
};

export default Header;
