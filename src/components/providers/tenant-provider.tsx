"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface TenantContextType {
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  setTenantId: () => {},
});

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a saved tenant ID on load
    const savedTenantId = localStorage.getItem("tenantId");
    if (savedTenantId) {
      setTenantIdState(savedTenantId);
    }
  }, []);

  const setTenantId = (id: string | null) => {
    setTenantIdState(id);
    if (id) {
      localStorage.setItem("tenantId", id);
    } else {
      localStorage.removeItem("tenantId");
    }
  };

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenantContext = () => useContext(TenantContext);
