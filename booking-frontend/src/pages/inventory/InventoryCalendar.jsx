import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { getBookings } from "../../api/booking.api";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiList, FiInfo } from "react-icons/fi";

export default function InventoryCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const res = await getBookings();
            const data = res.data || [];
            
            const mapped = data.map(b => {
                // Color Logic based on your Status Schema
                let bgColor = "#3b82f6"; // Default Blue
                if (b.status === "PENDING") bgColor = "#f59e0b";   // Amber
                if (b.status === "BOOKED") bgColor = "#10b981";    // Emerald
                if (b.status === "CANCELLED") bgColor = "#ef4444"; // Rose

                return {
                    id: b._id,
                    // Showing Room Number and Phone for quick reference
                    title: `R-${b.roomId?.roomNumber || '??'} | ${b.userId?.phone || 'No Phone'}`,
                    start: b.checkIn,
                    end: b.checkOut,
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    extendedProps: {
                        status: b.status,
                        payment: b.paymentStatus
                    }
                };
            });
            setEvents(mapped);
        } catch (error) {
            console.error("Error loading bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (info) => {
        navigate(`/bookings/${info.event.id}/edit`);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans">
            {/* 1. HEADER SECTION */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <FiCalendar size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            Inventory Timeline
                        </h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                        Real-time room occupancy and booking status overview
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status Legend */}
                    <div className="hidden lg:flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 mr-4">
                        <LegendItem color="bg-amber-500" label="Pending" />
                        <LegendItem color="bg-emerald-500" label="Booked" />
                        <LegendItem color="bg-rose-500" label="Cancelled" />
                    </div>

                    {/* <button
                        onClick={() => navigate("/bookings/list")}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                    >
                        <FiList strokeWidth={3} /> View List
                    </button> */}
                </div>
            </div>

            {/* 2. CALENDAR CONTAINER */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-6 lg:p-10">
                    {loading ? (
                        <div className="h-[600px] flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Calendar...</p>
                        </div>
                    ) : (
                        <div className="calendar-container">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                events={events}
                                eventClick={handleEventClick}
                                height="750px"
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "dayGridMonth,dayGridWeek"
                                }}
                                eventClassNames="cursor-pointer hover:scale-[1.02] transition-transform border-none rounded-lg px-2 py-1 text-[11px] font-bold shadow-sm"
                                dayMaxEvents={true}
                                // Enhancing the appearance of the headers
                                viewClassNames="rounded-xl overflow-hidden"
                            />
                        </div>
                    )}
                </div>
                
                {/* 3. FOOTER INFO */}
                <div className="bg-slate-50 px-10 py-4 border-t border-slate-100 flex items-center gap-2">
                    <FiInfo className="text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Click on any entry to modify booking details or process check-in
                    </span>
                </div>
            </div>

            {/* Custom Global CSS for FullCalendar Overrides */}
            <style dangerouslySetInnerHTML={{ __html: `
                .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em; color: #0f172a; }
                .fc .fc-button-primary { background-color: #f8fafc; border: 1px solid #e2e8f0; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 8px 16px; border-radius: 12px; }
                .fc .fc-button-primary:hover { background-color: #3b82f6; border-color: #3b82f6; color: white; }
                .fc .fc-button-active { background-color: #0f172a !important; border-color: #0f172a !important; }
                .fc th { background: #f8fafc; padding: 12px 0 !important; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; border: none !important; }
                .fc td { border: 1px solid #f1f5f9 !important; }
                .fc-event-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .fc-day-today { background: #eff6ff !important; }
            `}} />
        </div>
    );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-[10px] font-black uppercase text-slate-500">{label}</span>
        </div>
    );
}