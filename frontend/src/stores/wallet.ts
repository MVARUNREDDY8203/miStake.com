import { create } from "zustand";
interface WalletState {
    balance: number;
    placeBet: (amt: number) => void;
    addWinnings: (amt: number) => void;
    resetBalance: () => void;
    inResetProcess: boolean;
    toggleInResetProcess: () => void;
}
const DEFAULT_BALANCE = 10000;
const getInitialBalance = () => {
    const storedBalance = Number(localStorage.getItem("balance"));
    return storedBalance ? storedBalance : DEFAULT_BALANCE;
};
export const useWalletStore = create<WalletState>((set) => ({
    balance: getInitialBalance(),
    inResetProcess: false,
    placeBet: (amt) => {
        set((state) => {
            if (amt > state.balance) return state;

            const newBalance = state.balance - amt;
            localStorage.setItem("balance", newBalance.toString());
            return { balance: newBalance };
        });
    },
    addWinnings: (amt) => {
        set((state) => {
            const newBalance = state.balance + amt;
            localStorage.setItem("balance", newBalance.toString());
            return { balance: newBalance };
        });
    },
    resetBalance: () => {
        set(() => {
            localStorage.setItem("balance", DEFAULT_BALANCE.toString());
            return { balance: DEFAULT_BALANCE };
        });
    },
    toggleInResetProcess: () => {
        set((state) => {
            const newState = !state.inResetProcess;
            return { inResetProcess: newState };
        });
    },
}));
