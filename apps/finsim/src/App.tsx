import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import AppPage from './pages/AppPage';

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/finsim-pro">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={<AppPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;