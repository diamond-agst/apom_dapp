// src/types/global.d.ts
import type { Eip1193Provider } from "ethers";

type AccountsChangedHandler = (accounts: string[]) => void;
type ChainChangedHandler = (hexChainId: string) => void;
type DisconnectHandler = (err: { code: number; message: string }) => void;

type Eip1193WithEvents = Eip1193Provider & {
  isMetaMask?: boolean;
  on?: {
    (event: "accountsChanged", listener: AccountsChangedHandler): void;
    (event: "chainChanged", listener: ChainChangedHandler): void;
    (event: "disconnect", listener: DisconnectHandler): void;
  };
  removeListener?: {
    (event: "accountsChanged", listener: AccountsChangedHandler): void;
    (event: "chainChanged", listener: ChainChangedHandler): void;
    (event: "disconnect", listener: DisconnectHandler): void;
  };
};

declare global {
  interface Window {
    ethereum?: Eip1193WithEvents;
  }
}

export {};
