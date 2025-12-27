import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";

export default function MainLayout() {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50">

                {/* SIDEBAR */}
                <aside className="hidden lg:flex w-72 flex-shrink-0">
                    <Sidebar />
                </aside>

                {/* MAIN CONTENT WRAPPER */}
                <div className="flex flex-col flex-1 min-h-screen overflow-hidden">

                    {/* TOP BAR */}
                    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
                        <Topbar />
                    </header>

                    {/* PAGE CONTENT */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-[1600px] mx-auto px-4 py-6">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Outlet />
                            </div>
                        </div>
                    </main>

                    {/* FOOTER */}
                    <footer className="border-t bg-white px-6 py-4 text-sm text-slate-500">
                        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                            <span>
                                © {new Date().getFullYear()}{" "}
                                <span className="font-semibold text-blue-600">
                                    Guest Booking Platform
                                </span>
                            </span>

                            <div className="flex items-center gap-4">
                                <span className="text-xs hover:text-blue-600 cursor-pointer">
                                    Privacy Policy
                                </span>
                                <span className="text-xs hover:text-blue-600 cursor-pointer">
                                    Support
                                </span>
                                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                                    ● Online
                                </span>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </ProtectedRoute>
    );
}
