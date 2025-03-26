import { useWalletStore } from "../stores/wallet";

export default function Header() {
    const { balance, resetBalance } = useWalletStore();
    return (
        <div
            id="header"
            className="flex justify-center sticky top-0 w-full h-16 bg-stake-500 shadow-[0_4px_6px_-1px_#0003,0_2px_4px_-1px_#0000001f]"
        >
            {/* w-6xl header child */}
            <div
                id="header-child"
                className="flex w-6xl  items-center justify-between h-16 bg-[#1a2c38] text-white "
            >
                <img className="" src="./stake-logo-white.svg"></img>
                <div className="flex font-semibold text-sm" id="wallet-div">
                    <div className=" bg-stake-700 p-3 px-5 rounded-l-sm">
                        {"$" + balance.toFixed(2)}
                    </div>
                    <div
                        onClick={() => resetBalance()}
                        className="bg-stake-blue-500 p-3 rounded-r-sm"
                    >
                        Wallet
                    </div>
                </div>
                <div></div>
            </div>
        </div>
    );
}
