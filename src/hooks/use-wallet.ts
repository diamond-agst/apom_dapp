import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

export type WalletProvider =
  | "metamask"
  | "walletconnect"
  | "polkadotjs"
  | "guest";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [loading, setLoading] = useState(false);

  const connectMetaMask = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("MetaMask не установлен!");
        return;
      }

      const ethProvider = new BrowserProvider(window.ethereum);
      setProvider(ethProvider);

      const accounts = await ethProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const network = await ethProvider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (err) {
      console.error("MetaMask connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return {
    account,
    chainId,
    provider,
    loading,
    connectMetaMask,
    disconnect,
  };
}
