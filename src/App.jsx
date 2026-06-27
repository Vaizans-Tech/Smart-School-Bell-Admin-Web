import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SchoolProvider } from './context/SchoolContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Bell from './pages/Bell';
import Azan from './pages/Azan';
import Users from './pages/Users';

function RequireAuth() {
  return localStorage.getItem('token') ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <SchoolProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/bell" element={<Bell />} />
            <Route path="/azan" element={<Azan />} />
            <Route path="/users" element={<Users />} />
            <Route path="/schedules" element={<Navigate to="/bell" replace />} />
            <Route path="/sounds" element={<Navigate to="/bell" replace />} />
            <Route path="/announcements" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SchoolProvider>
    </BrowserRouter>
  );
}
