import { AreaChart, Area, XAxis, YAxis } from "recharts";
import { useWalletStore } from "../stores/wallet";
import { useEffect } from "react";
import { DEFAULT_BALANCE } from "../constants/constants";

export default function Graph() {
    const { transactions } = useWalletStore();

    useEffect(() => {
        console.log("Transactions:", transactions);
    }, [transactions]);

    function gradientOffset() {
        if (!transactions.length) return 0.5; // Default to middle if no data
        const dataMax = Math.max(...transactions.map((i) => i.balance));
        const dataMin = Math.min(...transactions.map((i) => i.balance));
        const adjustedMax = dataMax - DEFAULT_BALANCE;
        const adjustedMin = dataMin - DEFAULT_BALANCE;

        if (adjustedMax <= 0) {
            return 0;
        }
        if (adjustedMin >= 0) {
            return 1;
        }
        return adjustedMax / (adjustedMax - adjustedMin); // Calculating relative offset
    }
    const offset = gradientOffset();

    const dataMin: number = Math.min(...transactions.map((v, _) => v.balance));
    const dataMax: number = Math.max(...transactions.map((v, _) => v.balance));
    const yDomain = [dataMin - 1000, dataMax + 1000];
    const customToolTip = ({
        active,
        payload,
    }: {
        active: any;
        payload: any;
    }) => {
        if (active && payload && payload.length) {
            return <div className="bg-gray-400">{payload[0].value}</div>;
        }
        return null;
    };
    return (
        <div className="flex items-center justify-center rounded-xl bg-stake-700 w-[95%]">
            <AreaChart
                width={300}
                height={200}
                data={transactions}
                margin={{
                    top: 10,
                    right: 5,
                    left: -60,
                    bottom: -20,
                }}
            >
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="created_at" tick={false} axisLine={false} />
                <YAxis domain={yDomain} tick={false} axisLine={false} />
                {/* <Tooltip
                    contentStyle={{
                        backgroundColor: "#1a1a1a",
                        borderRadius: "8px",
                        border: "none",
                        padding: "10px",
                        color: "#ffffff",
                    }}
                    label={"balance"}
                    active={false}
                /> */}
                <defs>
                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset={offset}
                            stopColor="green"
                            stopOpacity={1}
                        />
                        <stop
                            offset={offset}
                            stopColor="red"
                            stopOpacity={0.3}
                        />
                    </linearGradient>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset={offset}
                            stopColor="#01e802"
                            stopOpacity={1}
                        />
                        <stop offset={offset} stopColor="red" stopOpacity={1} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="url(#lineColor)"
                    fill="url(#splitColor)"
                    strokeWidth={2}
                    baseValue={DEFAULT_BALANCE} // Set to 0 to properly handle positive and negative balances
                />
            </AreaChart>
        </div>
    );
}
