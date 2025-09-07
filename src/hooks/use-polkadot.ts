import { useState } from "react";
import { web3Enable, web3Accounts, web3FromAddress } from "@polkadot/extension-dapp";
import { ApiPromise, WsProvider } from "@polkadot/api";

type ChainPreset = "polkadot" | "kusama" | "westend" | "custom";

const RPC: Record<Exclude<ChainPreset, "custom">, string> = {
  polkadot: "wss://rpc.polkadot.io",
  kusama: "wss://kusama-rpc.polkadot.io",
  westend: "wss://westend-rpc.polkadot.io",
};

export function usePolkadot() {
  const [address, setAddress] = useState<string | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectPolkadot(preset: ChainPreset = "polkadot", customRpc?: string) {
    setLoading(true);
    setError(null);
    try {

      const extensions = await web3Enable("APOM DApp");
      if (!extensions.length) {
        throw new Error("Polkadot.js Extension не найден. Установи его в браузер.");
      }

      const accounts = await web3Accounts();
      if (!accounts.length) throw new Error("В расширении нет аккаунтов.");

      const acc = accounts[0];
      setAddress(acc.address);

      const endpoint = preset === "custom" ? (customRpc || "") : RPC[preset];
      if (!endpoint) throw new Error("RPC эндпоинт не задан.");

      const provider = new WsProvider(endpoint);
      const apiPromise = await ApiPromise.create({ provider });
      setApi(apiPromise);

      const injector = await web3FromAddress(acc.address);
      apiPromise.setSigner(injector.signer);

      return { address: acc.address, api: apiPromise };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Polkadot connect error";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function disconnectPolkadot() {
    try {
      await api?.disconnect();
      // eslint-disable-next-line no-empty
    } catch {}
    setApi(null);
    setAddress(null);
  }

  async function signMessage(message: string) {
    if (!address) throw new Error("Нет подключённого аккаунта.");
    const { signer } = await web3FromAddress(address);
    const res = await signer.signRaw({
      address,
      data: `0x${Buffer.from(message, "utf8").toString("hex")}`,
      type: "bytes",
    });
    return res.signature as string;
  }

  return { loading, error, address, api, connectPolkadot, disconnectPolkadot, signMessage };
}
