import { create } from "zustand";
import { TransactionType } from "../types/types";
import { DEFAULT_BALANCE } from "../constants/constants";
interface WalletState {
    balance: number;
    placeBet: (amt: number) => void;
    addWinnings: (amt: number) => void;
    resetBalance: () => void;
    inResetProcess: boolean;
    toggleInResetProcess: () => void;
    transactions: WalletTransactionType[];
    addTransaction: (transaction: TransactionType) => void;
    resetTransactions: () => void;
}
interface WalletTransactionType extends TransactionType {
    balance: number;
}

const DEFAULT_TRANSACTION: WalletTransactionType = {
    created_at: new Date().toISOString(),
    init_val: DEFAULT_BALANCE,
    final_val: DEFAULT_BALANCE,
    multiplier: 1,
    game: "reset balance",
    balance: DEFAULT_BALANCE,
};
const getInitialBalance = () => {
    const storedBalance = Number(localStorage.getItem("balance"));
    return storedBalance ? storedBalance : DEFAULT_BALANCE;
};
const getTransactions = () => {
    const storedTransactions = localStorage.getItem("transactions");
    try {
        return storedTransactions
            ? JSON.parse(storedTransactions)
            : [DEFAULT_TRANSACTION];
    } catch {
        return [DEFAULT_TRANSACTION];
    }
};
export const useWalletStore = create<WalletState>((set) => ({
    balance: getInitialBalance(),
    transactions: getTransactions(),
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
    addTransaction: (transaction: TransactionType) => {
        set((state) => {
            const newTransaction: WalletTransactionType = {
                ...transaction,
                balance: state.balance,
            };
            const newTransactions: WalletTransactionType[] = [
                ...state.transactions,
                newTransaction,
            ];
            localStorage.setItem(
                "transactions",
                JSON.stringify(newTransactions)
            );
            return { transactions: newTransactions };
        });
    },
    resetTransactions: () => {
        set(() => {
            localStorage.setItem(
                "transactions",
                JSON.stringify([DEFAULT_TRANSACTION])
            );
            return { transactions: [DEFAULT_TRANSACTION] };
        });
    },
}));
