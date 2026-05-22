import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const SchoolContext = createContext(null);

async function fetchSchoolList() {
  try {
    const { data } = await api.get('/api/auth/schools');
    if (Array.isArray(data)) return data;
  } catch (err) {
    if (err.response?.status !== 404) throw err;
  }

  // Production fallback when /api/auth/schools is not deployed
  const { data: users } = await api.get('/api/admin/users');
  return [...new Set((users || []).map(u => u.school_name).filter(Boolean))];
}

export function SchoolProvider({ children }) {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(
    () => localStorage.getItem('selectedSchool') || ''
  );

  useEffect(() => {
    fetchSchoolList()
      .then(list => {
        setSchools(list);
        const stored = localStorage.getItem('selectedSchool') || '';
        const valid = stored && list.includes(stored);
        if (valid) {
          setSelectedSchool(stored);
        } else if (list.length > 0) {
          setSelectedSchool(list[0]);
          localStorage.setItem('selectedSchool', list[0]);
        } else {
          setSelectedSchool('');
          localStorage.removeItem('selectedSchool');
        }
      })
      .catch(() => {
        setSchools([]);
      });
  }, []);

  const selectSchool = name => {
    setSelectedSchool(name);
    if (name) localStorage.setItem('selectedSchool', name);
    else localStorage.removeItem('selectedSchool');
  };

  return (
    <SchoolContext.Provider value={{ schools, selectedSchool, selectSchool }}>
      {children}
    </SchoolContext.Provider>
  );
}

export const useSchool = () => useContext(SchoolContext);
