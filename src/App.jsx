import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FormWorkspace from './pages/FormWorkspace';
import AccessControl from './pages/AccessControl';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-loader"><span className="spinner" />Loading secure workspace…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function HomeRedirect() {
  return <Navigate to={localStorage.getItem('token') ? '/app/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<Protected><Layout /></Protected>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="access-control" element={<AccessControl />} />
        <Route path=":formPath" element={<FormWorkspace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
