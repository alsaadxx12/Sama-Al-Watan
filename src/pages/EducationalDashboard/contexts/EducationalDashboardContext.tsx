import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EducationalDashboardContextType {
  isRefreshing: boolean;
  lastUpdated: Date;
  setRefreshing: (refreshing: boolean) => void;
  updateLastUpdated: () => void;
}

const EducationalDashboardContext = createContext<EducationalDashboardContextType | undefined>(undefined);

interface EducationalDashboardProviderProps {
  children: ReactNode;
}

export const EducationalDashboardProvider: React.FC<EducationalDashboardProviderProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const setRefreshing = (refreshing: boolean) => {
    setIsRefreshing(refreshing);
  };

  const updateLastUpdated = () => {
    setLastUpdated(new Date());
  };

  return (
    <EducationalDashboardContext.Provider
      value={{
        isRefreshing,
        lastUpdated,
        setRefreshing,
        updateLastUpdated
      }}
    >
      {children}
    </EducationalDashboardContext.Provider>
  );
};

export const useEducationalDashboard = (): EducationalDashboardContextType => {
  const context = useContext(EducationalDashboardContext);
  if (context === undefined) {
    throw new Error('useEducationalDashboard must be used within an EducationalDashboardProvider');
  }
  return context;
};