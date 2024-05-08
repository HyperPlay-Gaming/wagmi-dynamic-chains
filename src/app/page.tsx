"use client";

import { useContext, useEffect } from "react";
import { Chain } from "viem/chains";
import {
  createConfig,
  http,
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { WagmiChainsContext } from "./providers";
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors";

function useWagmiChains() {
  const { chains, setChains, nonConfiguredChains, ...rest } =
    useContext(WagmiChainsContext);

  const addChain = (chain: Chain) => {
    setChains((prev) => [...prev, chain]);
  };

  return { chains, addChain, nonConfiguredChains, ...rest };
}

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const {
    addChain,
    nonConfiguredChains,
    setNonConfiguredChains,
    setConfig,
    chains: contextChain,
  } = useWagmiChains();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WC_PROJECT_ID) {
      throw new Error("NEXT_PUBLIC_WC_PROJECT_ID is required");
    }

    const newTransports = contextChain.reduce(
      (acc, chain) => {
        acc[chain.id] = http();
        return acc;
      },
      {} as Record<string, ReturnType<typeof http>>
    );

    const newConfig = createConfig({
      // @ts-expect-error
      chains: contextChain,
      connectors: [
        injected(),
        coinbaseWallet({ appName: "Create Wagmi" }),
        walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID }),
      ],
      ssr: true,
      transports: newTransports,
    });

    setConfig(newConfig);
    setNonConfiguredChains(
      nonConfiguredChains.filter(
        (chain) => !contextChain.some((c) => c.id === chain.id)
      )
    );
  }, [contextChain]);

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <div>
        <h2>Avilable Chains</h2>
        {chains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => switchChain({ chainId: chain.id })}
          >
            {chain.name}
          </button>
        ))}
      </div>

      <div>
        <h2>Non-configured Chains</h2>
        {nonConfiguredChains.map((chain) => (
          <button key={chain.id} onClick={() => addChain(chain)}>
            {chain.name}
          </button>
        ))}
      </div>
    </>
  );
}

export default App;
