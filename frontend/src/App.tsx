import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import MinesPage from "./pages/Mines";
import GameLayout from "./components/GameLayout";

function App() {
    const [loadingScreen, setLoadingScreen] = useState<boolean>(false);
    useEffect(() => {
        const timer = setTimeout(() => setLoadingScreen(false), 3700);
        return () => clearTimeout(timer);
    });
    return (
        <>
            {loadingScreen && (
                <div className="bg-stake-500 flex items-center justify-center w-screen h-screen">
                    <img className="w-25" src="./Stake-preloader.gif"></img>
                </div>
            )}
            {!loadingScreen && (
                <Layout>
                    <MinesPage></MinesPage>
                    {/* <GameLayout></GameLayout> */}
                </Layout>
            )}
        </>
    );
}

export default App;
