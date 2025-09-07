import { useRef, useState } from "react";
import type { ProposalTypes, SessionTypes } from "@walletconnect/types";
import { isStorageAvailable } from "@/utils/isStorageAvailable";

const PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID as string;

const OPTIONAL_NAMESPACES: ProposalTypes.OptionalNamespaces = {
  eip155: {
    methods: [
      "eth_sendTransaction",
      "eth_sign",
      "personal_sign",
      "eth_signTypedData",
      "eth_signTransaction",
    ],
    chains: ["eip155:1", "eip155:137"],
    events: ["accountsChanged", "chainChanged"],
  },
};

type CoreCtor = typeof import("@walletconnect/core").Core;
type SignClientNS = typeof import("@walletconnect/sign-client");
type ModalNS = typeof import("@walletconnect/modal");

export function useWalletConnect() {
  const coreRef = useRef<InstanceType<CoreCtor> | null>(null);
  const signClientRef = useRef<
    import("@walletconnect/sign-client").default | null
  >(null);
  const modalRef = useRef<InstanceType<ModalNS["WalletConnectModal"]> | null>(
    null
  );

  const [address, setAddress] = useState<string | null>(null);
  const [chain, setChain] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ensureClients() {
    if (!PROJECT_ID) throw new Error("VITE_WC_PROJECT_ID is missing in .env");

    if (!isStorageAvailable()) {
      throw new Error(
        "Browser storage is blocked. Disable private mode, allow site data/cookies, or open the app outside a sandboxed iframe."
      );
    }

    const [{ Core }, SignClientModule, ModalModule] = await Promise.all([
      import("@walletconnect/core") as Promise<{ Core: CoreCtor }>,
      import("@walletconnect/sign-client") as Promise<SignClientNS>,
      import("@walletconnect/modal") as Promise<ModalNS>,
    ]);

    if (!coreRef.current) {
      coreRef.current = new Core({ projectId: PROJECT_ID });
    }

    if (!signClientRef.current) {
      signClientRef.current = await SignClientModule.default.init({
        projectId: PROJECT_ID,
        core: coreRef.current!,
      });
    }

    if (!modalRef.current) {
      modalRef.current = new ModalModule.WalletConnectModal({
        projectId: PROJECT_ID,
        themeMode: "dark",
        explorerExcludedWalletIds: "ALL",
      });
    }
  }

  async function connectWalletConnect() {
    setLoading(true);
    setError(null);
    try {
      await ensureClients();
      const client = signClientRef.current!;
      const modal = modalRef.current!;

      const { uri, approval } = await client.connect({
        optionalNamespaces: OPTIONAL_NAMESPACES,
      });

      if (uri) await modal.openModal({ uri });

      const session = await approval();
      modal.closeModal();

      const acc = session.namespaces.eip155.accounts[0];
      const [, ch, addr] = acc.split(":");
      setAddress(addr);
      setChain(`eip155:${ch}`);
      setTopic(session.topic);

      client.on("session_event", (sessionEvent) => {
        const { event } = sessionEvent.params;
        if (event.name === "accountsChanged") {
          const a = (event.data as string[])[0];
          if (a) setAddress(a);
        }
        if (event.name === "chainChanged") {
          const chId = String(event.data);
          setChain(`eip155:${chId}`);
        }
      });

      client.on("session_delete", () => {
        disconnectWalletConnect();
      });

      return { address: addr, chain: `eip155:${ch}` };
    } catch (e) {
      console.error("[WC] connect error:", e);
      try {
        modalRef.current?.closeModal();
        // eslint-disable-next-line no-empty
      } catch {}
      setError(e instanceof Error ? e.message : "WalletConnect error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function disconnectWalletConnect() {
    try {
      const client = signClientRef.current;
      if (client && topic) {
        await client.disconnect({
          topic,
          reason: { code: 6000, message: "User disconnected" },
        });
      }
    } catch (e) {
      console.warn("[WC] disconnect warn:", e);
    } finally {
      setAddress(null);
      setChain(null);
      setTopic(null);
    }
  }

  return {
    loading,
    error,
    address,
    chain,
    connectWalletConnect,
    disconnectWalletConnect,
  };
}
