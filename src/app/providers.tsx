"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { Config, WagmiProvider, createConfig, http } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

import { config as defaultConfig } from "@/wagmi";
import {
  polygon,
  acala,
  ancient8,
  ancient8Sepolia,
  saigon,
  scroll,
  canto,
  celo,
  cronos,
  Chain,
} from "viem/chains";

const defaultNonConfiguredChains = [
  polygon,
  acala,
  ancient8,
  ancient8Sepolia,
  saigon,
  scroll,
  canto,
  celo,
  cronos,
];

export const WagmiChainsContext = createContext<{
  config: Config;
  chains: Chain[];
  nonConfiguredChains: Chain[];
  setChains: React.Dispatch<React.SetStateAction<Chain[]>>;
  setNonConfiguredChains: React.Dispatch<React.SetStateAction<Chain[]>>;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}>({
  config: defaultConfig,
  chains: [],
  nonConfiguredChains: [],
  setChains: () => {},
  setNonConfiguredChains: () => {},
  setConfig: () => {},
});

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [config, setConfig] = useState(defaultConfig);

  // @ts-expect-error
  const [chains, setChains] = useState(defaultConfig.chains as Chain[]);
  const [nonConfiguredChains, setNonConfiguredChains] = useState(
    defaultNonConfiguredChains as Chain[]
  );

  return (
    <WagmiChainsContext.Provider
      value={{
        config,
        nonConfiguredChains,
        chains,
        setChains,
        setNonConfiguredChains,
        // @ts-expect-error
        setConfig,
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      </WagmiProvider>
    </WagmiChainsContext.Provider>
  );
}
