import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SchoolProvider } from './context/SchoolContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Schedules from './pages/Schedules';
import Sounds from './pages/Sounds';
import Announcements from './pages/Announcements';
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
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/devices"       element={<Devices />} />
            <Route path="/schedules"     element={<Schedules />} />
            <Route path="/sounds"        element={<Sounds />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/users"         element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SchoolProvider>
    </BrowserRouter>
  );
}
