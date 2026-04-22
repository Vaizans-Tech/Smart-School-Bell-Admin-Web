import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const SchoolContext = createContext(null);

export function SchoolProvider({ children }) {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(
    () => localStorage.getItem('selectedSchool') || ''
  );

  useEffect(() => {
    api.get('/api/auth/schools')
      .then(r => {
        setSchools(r.data);
        // Auto-select first school if none selected
        if (!selectedSchool && r.data.length > 0) {
          const first = r.data[0];
          setSelectedSchool(first);
          localStorage.setItem('selectedSchool', first);
        }
      })
      .catch(() => {});
  }, []);

  const selectSchool = (name) => {
    setSelectedSchool(name);
    localStorage.setItem('selectedSchool', name);
  };

  return (
    <SchoolContext.Provider value={{ schools, selectedSchool, selectSchool }}>
      {children}
    </SchoolContext.Provider>
  );
}

export const useSchool = () => useContext(SchoolContext);
