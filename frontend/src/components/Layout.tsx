import Header from "./Header";
import SideBar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div id="layout1" className="flex h-screen">
                <SideBar></SideBar>
                <div className="flex flex-col flex-1 items-center">
                    <Header></Header>
                    <div
                        id="test"
                        className="flex flex-1 justify-center w-full overflow-auto bg-stake-500 text-white"
                    >
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
