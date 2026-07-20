"use client";

import * as React from "react";

import { create } from "zustand";

export type TConfig = {
  title: string;
  description: string;
};

interface ICreateStoreParams {
  config: TConfig;
}

type ICreateStore = ICreateStoreParams & {
  setConfig: (config: TConfig) => void;
};

function createStore({ config }: ICreateStoreParams) {
  return create<ICreateStore>()((set) => ({
    config,
    setConfig: (config) => set({ config }),
  }));
}

const ConfigContext = React.createContext<ReturnType<typeof createStore> | null>(null);

export function useConfig() {
  if (!ConfigContext) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  return React.useContext(ConfigContext)!();
}

type IConfigProviderProps = ICreateStoreParams & {
  children: React.ReactNode;
};

export function ConfigProvider({ config, children }: IConfigProviderProps) {
  const [store] = React.useState(() => createStore({ config }));

  return <ConfigContext.Provider value={store}>{children}</ConfigContext.Provider>;
}
