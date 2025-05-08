// src/context/MaintenanceContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

export interface MaintenanceLog {
  id: string;
  aircraftId: string;
  model: string;
  userId: string;
  userName: string;
  location: string;
  date: string;
  status: string;
  details: string;
}

interface MaintenanceContextType {
  logs: MaintenanceLog[];
  updateLog: (id: string, updated: Partial<MaintenanceLog>) => void;
  addLog: (newLog: MaintenanceLog) => void; // ✅ Ajout
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const initialLogs: MaintenanceLog[] = [
  { id: '1', aircraftId: '123', model: 'A320', userId: '1005', userName: 'Somsak_m', location: 'Hangar A', date: '2024-10-28', status: 'Pending', details: 'Replace hydraulic system' },
  { id: '2', aircraftId: '124', model: 'B737', userId: '1006', userName: 'Jane_d', location: 'Hangar B', date: '2024-11-10', status: 'Completed', details: 'Engine inspection' },
  { id: '3', aircraftId: '125', model: 'A350', userId: '1007', userName: 'John_s', location: 'Hangar C', date: '2024-12-05', status: 'Cancelled', details: 'Landing gear check' },
  { id: '4', aircraftId: '126', model: 'B777', userId: '1008', userName: 'Alice_m', location: 'Hangar D', date: '2025-01-15', status: 'In progress', details: 'Avionics upgrade' },
];

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState(initialLogs);

  const updateLog = (id: string, updated: Partial<MaintenanceLog>) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updated } : log))
    );
  };

  const addLog = (newLog: MaintenanceLog) => {
    setLogs((prev) => [...prev, newLog]);
  };

  return (
    <MaintenanceContext.Provider value={{ logs, updateLog, addLog }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (!context) throw new Error('useMaintenance must be used within a MaintenanceProvider');
  return context;
}
