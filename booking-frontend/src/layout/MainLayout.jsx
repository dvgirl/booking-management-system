import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";

export default function MainLayout() {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50/50">
                {/* SIDEBAR: 
                   Hidden on mobile by default (handled inside Sidebar component), 
                   but we reserve width on desktop (w-64).
                */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0">
                    
                    {/* TOPBAR: 
                       Sticky position so it's always available.
                       z-index ensures it stays above the page content.
                    */}
                    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
                        <Topbar />
                    </header>

                    {/* PAGE CONTENT:
                       'min-h-[calc(100vh-64px)]' ensures the content fills 
                       the remaining screen height (assuming topbar is 64px).
                    */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto">
                        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
                            <Outlet /> 
                        </div>
                    </main>

                    {/* OPTIONAL: Professional Footer */}
                    <footer className="py-4 px-8 border-t border-gray-100 bg-white text-center">
                        <p className="text-xs text-gray-400">
                            © {new Date().getFullYear()} Your Company Name. All rights reserved.
                        </p>
                    </footer>
                </div>
            </div>
        </ProtectedRoute>
    );
}