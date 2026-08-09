import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import HomePage from './pages/HomePage';
import RegionPage from './pages/RegionPage';
import RoutePage from './pages/RoutePage';
import GearKnowledgePage from './pages/GearKnowledgePage';
import GearSystemPage from './pages/GearSystemPage';
import AuthPage from './pages/AuthPage';
import FavoritesPage from './pages/FavoritesPage';
import MyGearPage from './pages/MyGearPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Nav />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/region/:regionSlug" element={<RegionPage />} />
            <Route path="/route/:routeSlug" element={<RoutePage />} />
            <Route path="/gear-knowledge" element={<GearKnowledgePage />} />
            <Route path="/gear-knowledge/:systemSlug" element={<GearSystemPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/my-gear" element={<MyGearPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
