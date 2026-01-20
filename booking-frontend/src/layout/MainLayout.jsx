import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";

export default function MainLayout() {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50">

                {/* SIDEBAR - Sticky position handled inside component */}
                <Sidebar />

                {/* MAIN CONTENT WRAPPER */}
                {/* REMOVED: overflow-hidden & h-screen. 
                    Allows native window scrolling while Sidebar sticks. */}
                <div className="flex flex-col flex-1 min-h-screen">

                    {/* TOP BAR */}
                    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                        <Topbar />
                    </header>

                    {/* PAGE CONTENT */}
                    <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Outlet />
                        </div>
                    </main>

                    {/* FOOTER */}
                    <footer className="border-t bg-white px-6 py-4 text-sm text-slate-500 mt-auto">
                        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                            <span>
                                © {new Date().getFullYear()}{" "}
                                <span className="font-semibold text-blue-600">
                                    Guest Booking Platform
                                </span>
                            </span>

                            <div className="flex items-center gap-4">
                                <span className="text-xs hover:text-blue-600 cursor-pointer transition-colors">
                                    Privacy Policy
                                </span>
                                <span className="text-xs hover:text-blue-600 cursor-pointer transition-colors">
                                    Support
                                </span>
                                <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online
                                </span>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </ProtectedRoute>
    );
}