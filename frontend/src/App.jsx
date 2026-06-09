import { useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import DashboardLayout from './components/common/DashboardLayout';
import { useAuth } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const { user } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'theme-clean-corporate';
    document.body.className = savedTheme;
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {user ? (
        <DashboardLayout>
          <AppRouter />
        </DashboardLayout>
      ) : (
        <AppRouter />
      )}
    </BrowserRouter>
  );
};

export default App;
