import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";

export default function MainLayout() {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50/50 selection:bg-blue-100 selection:text-blue-700">
                {/* SIDEBAR: Desktop fixed width, internal mobile handling */}
                <div className="hidden lg:block w-72 flex-shrink-0">
                    <Sidebar />
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0">
                    
                    {/* TOPBAR: Sticky and Blurry for that modern feel */}
                    <header className="sticky top-0 z-30">
                        <Topbar />
                    </header>

                    {/* PAGE CONTENT:
                        - Animated fade-in transition
                        - Responsive padding
                        - Max-width for professional data density
                    */}
                    <main className="flex-1 flex flex-col">
                        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-10">
                            {/* This wrapper provides a subtle entry animation for all sub-routes */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                                <Outlet /> 
                            </div>
                        </div>

                        {/* Professional Footer */}
                        <footer className="mt-auto py-6 px-8 border-t border-slate-200 bg-white/50">
                            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-[13px] font-medium text-slate-500">
                                    © {new Date().getFullYear()} <span className="text-blue-600">Guest Booking Platform</span>. All rights reserved.
                                </p>
                                <div className="flex items-center gap-6">
                                    <button className="text-[12px] font-semibold text-slate-400 hover:text-blue-600 transition-colors">Privacy Policy</button>
                                    <button className="text-[12px] font-semibold text-slate-400 hover:text-blue-600 transition-colors">Support Center</button>
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-green-700 uppercase tracking-tight">System Online</span>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}