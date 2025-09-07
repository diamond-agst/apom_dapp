import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export default function WalletConnectModal({ open, onClose, onSelect }: Props) {
  if (!open) return null;

  const wallets = [
    {
      id: "metamask",
      name: "MetaMask",
      chain: "EVM",
      desc: "Popular browser wallet for Ethereum & L2s",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      chain: "Multi-chain",
      desc: "Scan QR to connect mobile wallets",
    },
    {
      id: "polkadotjs",
      name: "Polkadot.js",
      chain: "Polkadot",
      desc: "Browser extension for Polkadot/Substrate",
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Connect Wallet"
      className="fixed inset-0 z-[1000] grid place-items-center"
    >
      <div
        className="absolute inset-0 bg-[#070a12]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-gradient-to-tr from-fuchsia-500/30 to-cyan-400/30 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-gradient-to-tr from-cyan-400/30 to-amber-300/30 blur-3xl" />
      </div>

      <div className="relative mx-4 w-full max-w-xl">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-sky-500 opacity-60 blur-sm" />
        <div
          className="relative rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl
                        max-h-[85vh] overflow-y-auto"
        >
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold leading-tight text-white">
                Connect your{" "}
                <span className="ml-2 bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
                  Wallet
                </span>
              </h3>
              <p className="mt-1 text-sm text-white/70">
                Choose a wallet to continue. You can change it later in
                Settings.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {wallets.map((w) => (
              <li key={w.id}>
                <button
                  onClick={() => onSelect(w.id)}
                  className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b1020]/60 p-4 text-left transition-[transform,box-shadow]
                             hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(88,84,214,0.25)] focus:outline-none"
                >
                  <div
                    className="absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(120deg, rgba(217,70,239,.35), rgba(45,212,191,.35))",
                    }}
                  />
                  <div className="relative flex items-start gap-3">
                    <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white">
                      ◎
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-base font-medium text-white">
                          {w.name}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-white/70">
                        {w.desc}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <footer className="mt-4 text-center text-[11px] text-white/50">
            By connecting a wallet you agree to the{" "}
            <a
              className="underline decoration-dotted hover:text-white"
              href="#terms"
            >
              Terms
            </a>
            .
          </footer>
        </div>
      </div>
    </div>,
    document.body
  );
}
