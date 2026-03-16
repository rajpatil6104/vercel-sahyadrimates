import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
/*import Auth from './pages/Auth';
import Profile from './pages/Profile';*/
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            {/*<Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />*/}
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    </AuthProvider>
  );
}

export default App;