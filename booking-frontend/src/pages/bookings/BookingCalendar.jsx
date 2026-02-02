import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState, useMemo } from "react";
import { getBookings, checkAvailability } from "../../api/booking.api";
import { initiateCashfreePayment, verifyCashfreePayment } from '../../api/transaction.api'; 
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
    MapPinIcon,
    BuildingOffice2Icon,
    GlobeAltIcon
} from "@heroicons/react/24/outline";

export default function UserBookingCalendar() {
    // --- STATE ---
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRoomModal, setShowRoomModal] = useState(false);
    
    // Search Params
    const [searchParams, setSearchParams] = useState({
        checkIn: null, 
        checkOut: null,
        adults: 2,
        children: 0,
        rooms: 1,
        city: "" 
    });

    const [selectionStep, setSelectionStep] = useState('checkIn');
    const [showGuestPopup, setShowGuestPopup] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [cashfree, setCashfree] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const STATUS_THEME = {
        CONFIRMED: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: <CheckCircleIcon className="w-3 h-3" />, label: 'Confirmed' },
        CHECKED_IN: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: <BuildingOfficeIcon className="w-3 h-3" />, label: 'Checked In' },
        CHECKED_OUT: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-500', icon: <ClockIcon className="w-3 h-3" />, label: 'Checked Out' },
        CANCELLED: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-400 line-through', icon: <NoSymbolIcon className="w-3 h-3" />, label: 'Cancelled' },
        PENDING: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: <ClockIcon className="w-3 h-3" />, label: 'Pending' }
    };

    // --- RENDER HELPERS ---
    const renderEventContent = (eventInfo) => {
        const isDraft = eventInfo.event.extendedProps.isDraft;
        if (isDraft) {
            return (
                <div className="w-full h-full p-2 bg-indigo-600/90 backdrop-blur-sm border border-indigo-500/50 rounded-lg shadow-lg flex flex-col justify-center items-center overflow-hidden animate-pulse">
                    <div className="text-[9px] text-indigo-100 font-bold uppercase tracking-widest leading-none mb-1">New Stay</div>
                    <div className="text-xs text-white font-black truncate tracking-wide">{eventInfo.event.title}</div>
                </div>
            );
        }
        const status = eventInfo.event.extendedProps.status || 'PENDING';
        const theme = STATUS_THEME[status] || STATUS_THEME.PENDING;
        return (
            <div className={`w-full h-full p-1.5 border rounded-lg shadow-sm flex items-center gap-2 overflow-hidden transition-all duration-200 hover:shadow-md ${theme.bg} ${theme.border}`}>
                <div className={`flex-shrink-0 p-1 rounded-full bg-white/50 ${theme.text}`}>{theme.icon}</div>
                <div className="flex flex-col min-w-0">
                    <span className={`text-[8px] font-black uppercase tracking-widest truncate opacity-80 ${theme.text}`}>{theme.label}</span>
                    <span className={`text-[10px] font-bold truncate text-slate-700`}>{eventInfo.event.title}</span>
                </div>
            </div>
        );
    };

    // --- EVENT HANDLERS ---
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

    const handleDateClick = (info) => {
        const clickedDate = info.dateStr;
        const today = new Date().toISOString().split('T')[0];
        if (clickedDate < today) return toast.warn("Cannot select past dates.");
        if (selectionStep === 'checkIn' || selectionStep === 'complete') {
            setSearchParams(prev => ({ ...prev, checkIn: clickedDate, checkOut: null }));
            setSelectionStep('checkOut');
        } else {
            if (new Date(clickedDate) <= new Date(searchParams.checkIn)) {
                setSearchParams(prev => ({ ...prev, checkIn: clickedDate, checkOut: null }));
            } else {
                setSearchParams(prev => ({ ...prev, checkOut: clickedDate }));
                setSelectionStep('complete');
            }
        }
    };

    // --- LOGIC & COMPUTATION ---
    const nightCount = useMemo(() => {
        if (!searchParams.checkIn || !searchParams.checkOut) return 0;
        const start = new Date(searchParams.checkIn);
        const end = new Date(searchParams.checkOut);
        return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
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

    useEffect(() => {
        const initCashfree = async () => {
            try { const instance = await load({ mode: "sandbox" }); setCashfree(instance); } 
            catch (e) { console.error("Cashfree SDK failed"); }
        };
        initCashfree();
        loadMyBookings();
    }, []);

    const loadMyBookings = async () => {
        try {
            setLoading(true);
            const res = await getBookings(); 
            const mapped = res.data.map(b => ({
                id: b._id,
                title: `${b.roomId?.hotelId?.name || 'Grand Stay'} - Rm ${b.roomId?.roomNumber || '?'}`,
                start: b.checkIn,
                end: b.checkOut,
                extendedProps: { 
                    status: b.status,
                    amount: b.totalAmount,
                    hotelName: b.roomId?.hotelId?.name,
                    location: `${b.roomId?.hotelId?.city || 'Local'}, ${b.roomId?.hotelId?.state || 'State'}`
                }
            }));
            setEvents(mapped);
        } catch (err) { toast.error("Failed to load bookings"); }
        finally { setLoading(false); }
    };

    const handleSearch = async () => {
        if (!searchParams.checkIn || !searchParams.checkOut) return toast.warn("Select dates first");
        setShowRoomModal(true);
        try {
            setLoadingRooms(true);
            const res = await checkAvailability(searchParams.checkIn, searchParams.checkOut, searchParams.city);
            setAvailableRooms(res.data.availableRooms || []);
        } catch (error) { toast.error("Availability check failed"); }
        finally { setLoadingRooms(false); }
    };

    const closeModal = () => setShowRoomModal(false);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* STICKY NAV SEARCH */}
            <div className="bg-white/90 backdrop-blur-xl shadow-lg sticky top-0 z-40 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black uppercase text-slate-900 leading-none">LuxStay<span className="text-indigo-600">.</span></h1>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Hotel Engine</span>
                    </div>
                    
                    <div className="flex-1 w-full lg:w-auto bg-slate-100/50 border border-slate-200 lg:rounded-full rounded-2xl p-1.5 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 shadow-inner">
                        <div className="px-6 py-2 flex flex-col justify-center rounded-l-full">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Location</label>
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-indigo-500" />
                                <input type="text" placeholder="Which city?" className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 p-0 w-28 placeholder:text-slate-300" value={searchParams.city} onChange={(e) => setSearchParams({...searchParams, city: e.target.value})} />
                            </div>
                        </div>
                        <button onClick={() => setSelectionStep('checkIn')} className={`px-6 py-2 text-left transition-all ${selectionStep === 'checkIn' ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''}`}>
                            <label className="text-[9px] font-black uppercase text-slate-400">Check In</label>
                            <div className="text-sm font-bold text-slate-800">{searchParams.checkIn || 'Select Date'}</div>
                        </button>
                        <button onClick={() => setSelectionStep('checkOut')} className={`px-6 py-2 text-left transition-all ${selectionStep === 'checkOut' ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''}`}>
                            <label className="text-[9px] font-black uppercase text-slate-400">Check Out</label>
                            <div className="text-sm font-bold text-slate-800">{searchParams.checkOut || 'Select Date'}</div>
                        </button>
                        <div className="p-1.5 pl-2">
                            <button onClick={handleSearch} className="w-full h-full bg-slate-900 hover:bg-indigo-600 text-white rounded-full lg:rounded-xl px-8 py-3 lg:py-0 transition-all font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                <MagnifyingGlassIcon className="w-4 h-4"/> Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CALENDAR */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 animate-in fade-in duration-1000">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-6 lg:p-10 relative overflow-hidden">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        selectable={true}
                        events={displayEvents} 
                        dateClick={handleDateClick} 
                        eventClick={handleEventClick} 
                        eventContent={renderEventContent} 
                        validRange={{ start: new Date().toISOString().split('T')[0] }}
                        height="auto"
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth' }}
                    />
                </div>
            </div>

            {/* DETAIL MODAL (Fixed Reference) */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
                      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100">
                        <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                        
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${STATUS_THEME[selectedBooking.status]?.bg} ${STATUS_THEME[selectedBooking.status]?.border} ${STATUS_THEME[selectedBooking.status]?.text}`}>
                            {STATUS_THEME[selectedBooking.status]?.icon || <InformationCircleIcon className="w-8 h-8"/>}
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{selectedBooking.hotelName || 'Property'}</h3>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-6 tracking-wider">
                            <MapPinIcon className="w-3 h-3 text-indigo-500" /> {selectedBooking.location}
                        </div>
                        
                        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                             <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <span>{selectedBooking.title}</span>
                                 <span className={STATUS_THEME[selectedBooking.status]?.text}>{selectedBooking.status}</span>
                             </div>
                             <div className="h-px bg-slate-200/60" />
                             <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</span>
                                 <span className="text-xl font-black text-slate-900 tracking-tighter">₹{selectedBooking.amount}</span>
                             </div>
                        </div>
                      </div>
                </div>
            )}

            {/* ROOM SELECTION (Updated UI) */}
            {showRoomModal && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal} />
                    <div className="relative w-full max-w-2xl bg-[#f8fafc] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
                        <div className="bg-white px-8 py-6 border-b flex justify-between items-start z-10 shadow-sm sticky top-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Available Rooms</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                                    <GlobeAltIcon className="w-3 h-3 text-indigo-500" /> 
                                    Showing results for {searchParams.city || 'all destinations'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {loadingRooms ? [1, 2].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse shadow-sm border border-slate-100"></div>) : 
                             availableRooms.length === 0 ? (
                                <div className="text-center py-32">
                                    <NoSymbolIcon className="w-16 h-16 mx-auto mb-4 text-slate-200"/>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No rooms available for these dates</p>
                                </div>
                             ) :
                             availableRooms.map(room => (
                                <div key={room._id} className="bg-white rounded-[2rem] p-1 shadow-sm border border-slate-200 hover:shadow-2xl hover:border-indigo-300 transition-all duration-500 group overflow-hidden">
                                    <div className="flex flex-col md:flex-row h-full">
                                        <div className="w-full md:w-52 h-52 md:h-auto bg-slate-100 rounded-[1.5rem] relative overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:scale-95 transition-transform duration-500">
                                            <BuildingOffice2Icon className="w-16 h-16 text-slate-200" />
                                            <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-xl">Room {room.roomNumber}</div>
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{room.hotelId?.name || 'Property Name'}</h3>
                                                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors group-hover:text-indigo-500">
                                                            <MapPinIcon className="w-3.5 h-3.5" /> {room.hotelId?.city}, {room.hotelId?.state}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-indigo-600 tracking-tighter">₹{room.price * nightCount}</div>
                                                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{nightCount} Night Stay</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 my-4">
                                                    <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-600 text-[9px] font-black uppercase border border-slate-100 tracking-tighter">{room.type}</span>
                                                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase border border-emerald-100 tracking-tighter">Secure Checkout</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <button className="py-3.5 rounded-2xl border-2 border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Book & Pay Later</button>
                                                <button className="py-3.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                                                    <CreditCardIcon className="w-4 h-4" /> Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}