import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState, useMemo } from "react";
import { getBookings, checkAvailability } from "../../api/booking.api";
// Updated Import to include generic Transaction functions if available, or we use the specific ones
import { initiateCashfreePayment, verifyCashfreePayment, createTransaction } from '../../api/transaction.api'; 
import { toast } from "react-toastify";
import { load } from "@cashfreepayments/cashfree-js";
import {
    CreditCardIcon,
    CalendarIcon,
    XMarkIcon,
    UserGroupIcon,
    MagnifyingGlassIcon,
    MinusCircleIcon,
    PlusCircleIcon,
    SparklesIcon,
    CheckBadgeIcon,
    BuildingOfficeIcon,
    ArrowRightIcon,
    CursorArrowRaysIcon,
    InformationCircleIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    BanknotesIcon,
    QrCodeIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function UserBookingCalendar() {
    // --- STATE ---
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRoomModal, setShowRoomModal] = useState(false);
    
    // Advance Payment State
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [advanceLoading, setAdvanceLoading] = useState(false);
    const [advanceForm, setAdvanceForm] = useState({
        amount: '',
        ref: '',
        mode: 'CASH',
        notes: ''
    });

    // Search Params
    const [searchParams, setSearchParams] = useState({
        checkIn: null, 
        checkOut: null,
        adults: 2,
        children: 0,
        rooms: 1
    });

    // Selection Mode
    const [selectionStep, setSelectionStep] = useState('checkIn');
    const [showGuestPopup, setShowGuestPopup] = useState(false);
    
    // Data & API
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [cashfree, setCashfree] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // --- STATUS CONFIGURATION ---
    const STATUS_THEME = {
        CONFIRMED: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: <CheckCircleIcon className="w-3 h-3" />, label: 'Confirmed' },
        CHECKED_IN: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: <BuildingOfficeIcon className="w-3 h-3" />, label: 'Checked In' },
        CHECKED_OUT: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-500', icon: <ClockIcon className="w-3 h-3" />, label: 'Checked Out' },
        CANCELLED: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-400 line-through', icon: <NoSymbolIcon className="w-3 h-3" />, label: 'Cancelled' },
        PENDING: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: <ClockIcon className="w-3 h-3" />, label: 'Pending' }
    };

    // --- COMPUTED VALUES ---
    const nightCount = useMemo(() => {
        if (!searchParams.checkIn || !searchParams.checkOut) return 0;
        const start = new Date(searchParams.checkIn);
        const end = new Date(searchParams.checkOut);
        const diff = end - start;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [searchParams.checkIn, searchParams.checkOut]);

    const displayEvents = useMemo(() => {
        const baseEvents = [...events];
        if (searchParams.checkIn) {
            baseEvents.push({
                id: 'user-selection',
                title: selectionStep === 'checkIn' ? 'Check-In' : `${nightCount} Night Stay`,
                start: searchParams.checkIn,
                end: searchParams.checkOut || searchParams.checkIn, 
                display: 'block',
                extendedProps: { isDraft: true }
            });
        }
        return baseEvents;
    }, [events, searchParams, selectionStep, nightCount]);

    // --- INITIALIZATION ---
    useEffect(() => {
        const initCashfree = async () => {
            try {
                const instance = await load({ mode: "sandbox" }); 
                setCashfree(instance);
            } catch (e) { console.error("Cashfree SDK failed to load"); }
        };
        initCashfree();
        loadMyBookings();
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        
        setSearchParams(prev => ({
            ...prev,
            checkIn: tomorrow.toISOString().split('T')[0],
            checkOut: dayAfter.toISOString().split('T')[0]
        }));
        setSelectionStep('complete');
    }, []);

    const loadMyBookings = async () => {
        try {
            setLoading(true);
            const res = await getBookings(); 
            const mapped = res.data.map(b => ({
                id: b._id,
                title: `Room ${b.roomId?.roomNumber || '?'}`,
                start: b.checkIn,
                end: b.checkOut,
                extendedProps: { 
                    status: b.status,
                    amount: b.totalAmount,
                    type: b.roomId?.type
                }
            }));
            setEvents(mapped);
        } catch (err) {
            toast.error("Failed to sync ledger");
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleRecordAdvance = async (e) => {
        e.preventDefault();
        if (!advanceForm.amount || !advanceForm.ref) {
            toast.warn("Please enter amount and reference.");
            return;
        }

        try {
            setAdvanceLoading(true);
            // API Call simulation (Replace with actual API if available)
            // await createTransaction({ ...advanceForm, type: 'ADVANCE' }); 
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
            
            toast.success("Advance recorded successfully!");
            setShowAdvanceModal(false);
            setAdvanceForm({ amount: '', ref: '', mode: 'CASH', notes: '' });
            // Reload logic would go here
        } catch (error) {
            toast.error("Failed to record advance.");
        } finally {
            setAdvanceLoading(false);
        }
    };

    const renderEventContent = (eventInfo) => {
        const isDraft = eventInfo.event.extendedProps.isDraft;
        
        if (isDraft) {
            return (
                <div className="w-full h-full p-2 bg-indigo-600/90 backdrop-blur-sm border border-indigo-500/50 rounded-lg shadow-lg shadow-indigo-200 flex flex-col justify-center items-center overflow-hidden animate-pulse">
                    <div className="text-[9px] text-indigo-100 font-bold uppercase tracking-widest leading-none mb-1">New Booking</div>
                    <div className="text-xs text-white font-black truncate tracking-wide">{eventInfo.event.title}</div>
                </div>
            );
        }

        const status = eventInfo.event.extendedProps.status || 'PENDING';
        const theme = STATUS_THEME[status] || STATUS_THEME.PENDING;

        return (
            <div className={`w-full h-full p-1.5 border rounded-lg shadow-sm flex items-center gap-2 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${theme.bg} ${theme.border}`}>
                <div className={`flex-shrink-0 p-1 rounded-full bg-white/50 ${theme.text}`}>
                    {theme.icon}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className={`text-[8px] font-black uppercase tracking-widest truncate opacity-80 ${theme.text}`}>
                        {theme.label}
                    </span>
                    <span className={`text-[10px] font-bold truncate text-slate-700 ${status === 'CANCELLED' ? 'line-through opacity-50' : ''}`}>
                        {eventInfo.event.title}
                    </span>
                </div>
            </div>
        );
    };

    const handleDateClick = (info) => {
        const clickedDate = info.dateStr;
        const today = new Date().toISOString().split('T')[0];

        if (clickedDate < today) {
            toast.warn("Cannot select past dates.", { position: "bottom-center" });
            return;
        }

        if (selectionStep === 'checkIn' || selectionStep === 'complete') {
            setSearchParams(prev => ({ ...prev, checkIn: clickedDate, checkOut: null }));
            setSelectionStep('checkOut');
            toast.info("Check-in set. Select Check-out date.", { position: "bottom-center", icon: <CalendarIcon className="w-5 h-5"/> });
        } 
        else if (selectionStep === 'checkOut') {
            if (new Date(clickedDate) <= new Date(searchParams.checkIn)) {
                setSearchParams(prev => ({ ...prev, checkIn: clickedDate, checkOut: null }));
                toast.warning("Check-out corrected.", { position: "bottom-center" });
            } else {
                setSearchParams(prev => ({ ...prev, checkOut: clickedDate }));
                setSelectionStep('complete');
                toast.success("Dates Selected!", { position: "bottom-center" });
            }
        }
    };

    const handleEventClick = (info) => {
        const props = info.event.extendedProps;
        if (props.isDraft) {
            handleSearch();
        } else {
            setSelectedBooking({
                id: info.event.id,
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                ...props
            });
        }
    };

    const handleRangeSelect = (info) => {
        const today = new Date().toISOString().split('T')[0];
        if (info.startStr < today) return;

        setSearchParams(prev => ({
            ...prev,
            checkIn: info.startStr,
            checkOut: info.endStr
        }));
        setSelectionStep('complete');
    };

    const handleSearch = async () => {
        if (!searchParams.checkIn || !searchParams.checkOut) {
            toast.warn("Select dates first");
            return;
        }
        setShowRoomModal(true);
        loadAvailableRooms(searchParams.checkIn, searchParams.checkOut);
    };

    const loadAvailableRooms = async (checkIn, checkOut) => {
        try {
            setLoadingRooms(true);
            const res = await checkAvailability(checkIn, checkOut);
            setAvailableRooms(res.data.availableRooms || []);
        } catch (error) {
            toast.error("Availability check failed");
        } finally {
            setLoadingRooms(false);
        }
    };

    const processPayment = async (room, method) => {
        if (method === "PAY_LATER") {
            toast.info("Confirmed. Pay at desk.");
            return;
        }
        if (!cashfree) return;
        
        try {
            const res = await initiateCashfreePayment({
                roomId: room._id,
                checkIn: searchParams.checkIn,
                checkOut: searchParams.checkOut,
                amount: room.price * nightCount
            });
            cashfree.checkout({ paymentSessionId: res.data.cf_token, redirectTarget: "_modal" })
                .then((result) => { if (!result.error && !result.redirect) verifyPaymentOnServer(res.data.order_id); });
        } catch (err) { toast.error("Payment Error"); }
    };

    const verifyPaymentOnServer = async (orderId) => {
        const id = toast.loading("Verifying...");
        try {
            const res = await verifyCashfreePayment({ orderId });
            if (res.data.paymentStatus === "SUCCESS") {
                toast.update(id, { render: "Success!", type: "success", isLoading: false, autoClose: 3000 });
                loadMyBookings(); closeModal();
            } else toast.update(id, { render: "Incomplete", type: "warning", isLoading: false });
        } catch (err) { toast.update(id, { render: "Failed", type: "error", isLoading: false }); }
    };

    const closeModal = () => setShowRoomModal(false);

    const GuestCounter = ({ label, value, field }) => (
        <div className="flex items-center justify-between mb-3 last:mb-0">
            <span className="text-sm font-bold text-slate-700">{label}</span>
            <div className="flex items-center gap-3">
                <button onClick={() => setSearchParams(p => ({...p, [field]: Math.max(0, p[field] - 1)}))} className="text-slate-400 hover:text-indigo-600 transition-colors" disabled={value <= 0}><MinusCircleIcon className="w-6 h-6" /></button>
                <span className="w-4 text-center text-sm font-black">{value}</span>
                <button onClick={() => setSearchParams(p => ({...p, [field]: p[field] + 1}))} className="text-slate-400 hover:text-indigo-600 transition-colors"><PlusCircleIcon className="w-6 h-6" /></button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            
            {/* 1. SEARCH BAR & HEADER */}
            <div className="bg-white/90 backdrop-blur-xl shadow-lg shadow-indigo-100/40 sticky top-0 z-40 border-b border-slate-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="hidden lg:block">
                            <h1 className="text-xl font-black tracking-tighter uppercase text-slate-900">LuxStay<span className="text-indigo-600">.</span></h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Collection</p>
                        </div>
                        <div className="flex-1 w-full lg:w-auto bg-slate-50/50 border border-slate-200 lg:rounded-full rounded-2xl p-1.5 shadow-inner flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                            {/* Check In */}
                            <button onClick={() => setSelectionStep('checkIn')} className={`px-6 py-2 flex flex-col justify-center text-left relative rounded-t-xl lg:rounded-l-full lg:rounded-r-none transition-all duration-300 ${selectionStep === 'checkIn' ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/60'}`}>
                                <label className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${selectionStep === 'checkIn' ? 'text-indigo-600' : 'text-slate-400'}`}>Check In</label>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className={`w-4 h-4 ${selectionStep === 'checkIn' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className={`text-sm font-bold ${selectionStep === 'checkIn' ? 'text-indigo-900' : 'text-slate-800'}`}>
                                        {searchParams.checkIn ? new Date(searchParams.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Select Date'}
                                    </span>
                                </div>
                            </button>
                            {/* Check Out */}
                            <button onClick={() => setSelectionStep('checkOut')} className={`px-6 py-2 flex flex-col justify-center text-left relative transition-all duration-300 ${selectionStep === 'checkOut' ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/60'}`}>
                                <label className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${selectionStep === 'checkOut' ? 'text-indigo-600' : 'text-slate-400'}`}>Check Out</label>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className={`w-4 h-4 ${selectionStep === 'checkOut' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className={`text-sm font-bold ${selectionStep === 'checkOut' ? 'text-indigo-900' : 'text-slate-800'}`}>
                                        {searchParams.checkOut ? new Date(searchParams.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Select Date'}
                                    </span>
                                </div>
                            </button>
                            {/* Guests */}
                            <div className="px-6 py-2 flex flex-col justify-center relative hover:bg-white/60 transition-colors rounded-r-none lg:rounded-r-none">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Guests</label>
                                <button onClick={() => setShowGuestPopup(!showGuestPopup)} className="flex items-center gap-2 text-left">
                                    <UserGroupIcon className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm font-bold text-slate-800 truncate">{searchParams.adults} Adults, {searchParams.rooms} Room</span>
                                </button>
                                {showGuestPopup && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowGuestPopup(false)}></div>
                                        <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-20 animate-in slide-in-from-top-2 duration-200">
                                            <div className="mb-4"><h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Travellers</h3></div>
                                            <GuestCounter label="Rooms" value={searchParams.rooms} field="rooms" />
                                            <GuestCounter label="Adults" value={searchParams.adults} field="adults" />
                                            <GuestCounter label="Children" value={searchParams.children} field="children" />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="p-1.5 pl-2">
                                <button onClick={handleSearch} className="w-full h-full bg-slate-900 hover:bg-indigo-600 text-white rounded-full lg:rounded-xl px-8 py-3 lg:py-0 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest active:scale-95 duration-200">
                                    <MagnifyingGlassIcon className="w-4 h-4" /> <span className="hidden lg:inline">Search</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CALENDAR AREA */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3">
                         <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${selectionStep !== 'complete' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                             <CursorArrowRaysIcon className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">
                                 {selectionStep === 'checkIn' ? 'Select Check-In' : selectionStep === 'checkOut' ? 'Select Check-Out' : 'Dates Selected'}
                             </span>
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Status Legend */}
                        <div className="hidden lg:flex flex-wrap items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm">
                            {Object.values(STATUS_THEME).map((theme, i) => (
                                <div key={i} className="flex items-center gap-2" title={theme.label}>
                                    <div className={`w-2 h-2 rounded-full ring-2 ring-white ${theme.bg.replace('bg-', 'bg-').replace('50', '500')}`}></div>
                                    <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wide">{theme.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* NEW: Record Advance Button */}
                        <button 
                            onClick={() => setShowAdvanceModal(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white border border-transparent rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-slate-200 active:scale-95"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Record Advance</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12 relative overflow-hidden">
                    <style>{`
                        .fc { font-family: inherit; }
                        .fc-header-toolbar { margin-bottom: 2.5rem !important; padding: 0 0.5rem; }
                        .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 900; letter-spacing: -0.03em; color: #0f172a; text-transform: uppercase; }
                        .fc-button-primary { background-color: white !important; border: 1px solid #e2e8f0 !important; color: #64748b !important; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; padding: 0.75rem 1.5rem; border-radius: 9999px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: all 0.2s ease; }
                        .fc-button-primary:hover { background-color: #f8fafc !important; border-color: #cbd5e1 !important; color: #0f172a !important; transform: translateY(-1px); }
                        .fc-button-active { background-color: #0f172a !important; border-color: #0f172a !important; color: white !important; }
                        .fc-theme-standard .fc-scrollgrid { border: none; }
                        .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
                        .fc-col-header-cell-cushion { padding: 20px 0; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.15em; }
                        .fc-daygrid-day-frame { padding: 10px; min-height: 140px; transition: background-color 0.2s; }
                        .fc-daygrid-day:hover .fc-daygrid-day-frame { background-color: #f8fafc; cursor: pointer; border-radius: 1rem; }
                        .fc-daygrid-day-top { flex-direction: row; margin-bottom: 8px; }
                        .fc-daygrid-day-number { font-size: 0.9rem; font-weight: 700; color: #64748b; width: 100%; padding: 4px; }
                        .fc-day-today { background-color: transparent !important; }
                        .fc-day-today .fc-daygrid-day-frame { background: linear-gradient(to bottom right, #f8fafc, #ffffff); box-shadow: inset 0 0 0 2px #6366f1; border-radius: 1rem; }
                        .fc-day-today .fc-daygrid-day-number { color: #4f46e5; }
                        .fc-daygrid-event-harness { margin-top: 6px !important; }
                        .fc-event { background: transparent; border: none; box-shadow: none; cursor: pointer; }
                        .fc-scroller::-webkit-scrollbar { width: 0px; background: transparent; }
                    `}</style>

                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        selectable={true}
                        selectMirror={true}
                        events={displayEvents} 
                        dateClick={handleDateClick} 
                        select={handleRangeSelect} 
                        eventClick={handleEventClick} 
                        eventContent={renderEventContent} 
                        validRange={{ start: new Date().toISOString().split('T')[0] }}
                        height="auto"
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth' }}
                    />
                </div>
            </div>

            {/* 3. BOOKING DETAILS MODAL */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                     <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
                     <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-10 animate-in zoom-in-95 duration-200">
                        <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                        
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${STATUS_THEME[selectedBooking.status]?.bg || 'bg-slate-100'} ${STATUS_THEME[selectedBooking.status]?.text || 'text-slate-500'}`}>
                            {STATUS_THEME[selectedBooking.status]?.icon || <InformationCircleIcon className="w-8 h-8"/>}
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{selectedBooking.title}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${STATUS_THEME[selectedBooking.status]?.text}`}>
                            {selectedBooking.status}
                        </p>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                             <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</span>
                                 <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">{new Date(selectedBooking.start).toLocaleDateString()}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</span>
                                 <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">{new Date(selectedBooking.end).toLocaleDateString()}</span>
                             </div>
                             {selectedBooking.extendedProps?.amount && (
                                 <div className="pt-4 mt-4 border-t border-slate-200/60 flex justify-between items-center">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</span>
                                     <span className="text-xl font-black text-slate-900">₹{selectedBooking.extendedProps.amount}</span>
                                 </div>
                             )}
                        </div>
                     </div>
                </div>
            )}

            {/* 4. ROOM SELECTION MODAL */}
            {showRoomModal && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal} />
                    <div className="relative w-full max-w-2xl bg-[#f8fafc] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-100">
                        <div className="bg-white px-8 py-6 border-b border-slate-200 flex justify-between items-start z-10 shadow-sm">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Select Room</h2>
                                <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium text-xs">
                                    <span className="font-bold text-indigo-600">{searchParams.checkIn}</span>
                                    <ArrowRightIcon className="w-3 h-3" />
                                    <span className="font-bold text-indigo-600">{searchParams.checkOut}</span>
                                    <span className="mx-1 text-slate-300">|</span>
                                    <span className="text-slate-900 font-bold">{nightCount} Night(s)</span>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {loadingRooms ? [1, 2].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse shadow-sm border border-slate-100"></div>) : 
                             availableRooms.length === 0 ? <div className="text-center py-20 opacity-50"><BuildingOfficeIcon className="w-16 h-16 mx-auto mb-4"/>No Availability</div> :
                             availableRooms.map(room => (
                                <div key={room._id} className="bg-white rounded-3xl p-1 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group">
                                    <div className="flex flex-col md:flex-row h-full">
                                        <div className="w-full md:w-48 h-48 md:h-auto bg-slate-100 rounded-[1.2rem] relative overflow-hidden flex-shrink-0">
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-300"><SparklesIcon className="w-12 h-12" /></div>
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">{room.type}</div>
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 leading-tight">Suite {room.roomNumber}</h3>
                                                    <div className="flex gap-2 mt-2 mb-4">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wide border border-emerald-100"><CheckBadgeIcon className="w-3 h-3" /> Breakfast</span>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wide border border-indigo-100"><CheckBadgeIcon className="w-3 h-3" /> WiFi</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-slate-900">₹{room.price * nightCount}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-6 flex-1">{room.description || "Premium amenities included."}</p>
                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <button onClick={() => processPayment(room, "PAY_LATER")} className="py-3 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Pay Later</button>
                                                <button onClick={() => processPayment(room, "PAY_NOW")} className="py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"><CreditCardIcon className="w-4 h-4" /> Book Now</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. NEW: RECORD ADVANCE SLIDE-OVER */}
            {showAdvanceModal && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setShowAdvanceModal(false)} 
                    />
                    <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
                        <div className="w-screen max-w-md transform transition-transform duration-500 pointer-events-auto">
                            <div className="flex flex-col h-full bg-white shadow-2xl">
                                <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500 rounded-lg"><CurrencyRupeeIcon className="text-white w-6 h-6" /></div>
                                        <div>
                                            <h2 className="text-lg font-bold">Record Advance</h2>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Manual Entry</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAdvanceModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (INR)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-slate-400 font-bold group-focus-within:text-indigo-600">₹</span>
                                            </div>
                                            <input 
                                                type="number" 
                                                value={advanceForm.amount}
                                                onChange={(e) => setAdvanceForm({...advanceForm, amount: e.target.value})}
                                                className="block w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-0 focus:border-indigo-600 transition-colors text-lg"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference / Guest Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <DocumentTextIcon className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-600" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={advanceForm.ref}
                                                onChange={(e) => setAdvanceForm({...advanceForm, ref: e.target.value})}
                                                className="block w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-0 focus:border-indigo-600 transition-colors"
                                                placeholder="e.g. ADV-101"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Mode</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['CASH', 'UPI', 'CARD'].map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setAdvanceForm({...advanceForm, mode})}
                                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all flex flex-col items-center gap-2 ${advanceForm.mode === mode ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}`}
                                                >
                                                    {mode === 'CASH' && <BanknotesIcon className="w-5 h-5"/>}
                                                    {mode === 'UPI' && <QrCodeIcon className="w-5 h-5"/>}
                                                    {mode === 'CARD' && <CreditCardIcon className="w-5 h-5"/>}
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 border-t border-slate-100 bg-slate-50">
                                    <button 
                                        onClick={handleRecordAdvance}
                                        disabled={advanceLoading}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {advanceLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <CheckBadgeIcon className="w-5 h-5" />}
                                        {advanceLoading ? "Processing..." : "Confirm Advance"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}