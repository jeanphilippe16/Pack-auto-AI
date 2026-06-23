import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CarDetailPage from './pages/CarDetailPage';
import RentalsPage from './pages/RentalsPage';
import SalesPage from './pages/SalesPage';
import RepairsPage from './pages/RepairsPage';
import AIAgentsPage from './pages/AIAgentsPage';
import type { Page } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  function navigate(page: Page, carId?: string) {
    setCurrentPage(page);
    setSelectedCarId(carId || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderPage() {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'catalog':
        return <CatalogPage onNavigate={navigate} />;
      case 'car-detail':
        return selectedCarId ? <CarDetailPage carId={selectedCarId} onNavigate={navigate} /> : <CatalogPage onNavigate={navigate} />;
      case 'rentals':
        return <RentalsPage onNavigate={navigate} />;
      case 'sales':
        return <SalesPage onNavigate={navigate} />;
      case 'repairs':
        return <RepairsPage />;
      case 'ai-agents':
        return <AIAgentsPage />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={navigate} />
      <main className="flex-1 pt-16">{renderPage()}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
