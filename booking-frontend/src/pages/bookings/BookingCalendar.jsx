import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { getBookings, checkAvailability } from "../../api/booking.api";
import { initiateCashfreePayment, verifyCashfreePayment } from '../../api/transaction.api';
import { toast } from "react-toastify";
import { load } from "@cashfreepayments/cashfree-js";
import {
    CreditCardIcon,
    BanknotesIcon,  
    CalendarIcon,
    XMarkIcon,
    ArrowRightIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function UserBookingCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [selectedDates, setSelectedDates] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [cashfree, setCashfree] = useState(null);

    useEffect(() => {
        const initCashfree = async () => {
            const instance = await load({ mode: "sandbox" }); 
            setCashfree(instance);
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
                title: `Suite ${b.roomId?.roomNumber}`,
                start: b.checkIn,
                end: b.checkOut,
                backgroundColor: b.status === "CONFIRMED" ? "#10b981" : "#f59e0b",
                borderColor: "transparent",
                extendedProps: { status: b.status }
            }));
            setEvents(mapped);
        } catch (err) {
            toast.error("Failed to sync your reservation ledger");
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = async (info) => {
        const checkIn = info.startStr;
        // FullCalendar end date is exclusive, we keep it as is for the API
        const checkOut = info.endStr;
        setSelectedDates({ checkIn, checkOut });
        setShowRoomModal(true);
        loadAvailableRooms(checkIn, checkOut);
    };

    const loadAvailableRooms = async (checkIn, checkOut) => {
        try {
            setLoadingRooms(true);
            const res = await checkAvailability(checkIn, checkOut);
            setAvailableRooms(res.data.availableRooms || []);
        } catch (error) {
            toast.error("Error checking room availability");
        } finally {
            setLoadingRooms(false);
        }
    };

    const processPayment = async (room, method) => {
        if (method === "PAY_LATER") {
            // Logic for manual booking / pay at desk
            toast.info("Please contact front desk to secure this hold.");
            return;
        }

        if (!cashfree) {
            toast.error("Initializing secure gateway... Please wait.");
            return;
        }

        try {
            const res = await initiateCashfreePayment({
                roomId: room._id,
                checkIn: selectedDates.checkIn,
                checkOut: selectedDates.checkOut,
                amount: room.price
            });

            const { cf_token, order_id } = res.data;
            
            let checkoutOptions = {
                paymentSessionId: cf_token,
                redirectTarget: "_modal", 
            };

            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    toast.error(result.error.message || "Checkout session expired");
                    return;
                }
                if (result.redirect) {
                    // This is for 3DS or bank redirects
                    console.log("Redirecting to bank...");
                } else {
                    verifyPaymentOnServer(order_id);
                }
            });

        } catch (err) {
            toast.error("Gateway handshake failed. Check connection.");
        }
    };

    const verifyPaymentOnServer = async (orderId) => {
        const id = toast.loading("Verifying transaction with bank...");
        try {
            const verifyRes = await verifyCashfreePayment({ orderId });
            if (verifyRes.data.paymentStatus === "SUCCESS") {
                toast.update(id, { render: "Stay Confirmed! Enjoy your trip.", type: "success", isLoading: false, autoClose: 3000 });
                loadMyBookings();
                closeModal();
            } else {
                toast.update(id, { render: `Payment ${verifyRes.data.paymentStatus}`, type: "warning", isLoading: false, autoClose: 3000 });
            }
        } catch (err) {
            toast.update(id, { render: "Verification timeout. Check 'My Payments' later.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const closeModal = () => {
        setShowRoomModal(false);
        setSelectedDates(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Availability Calendar</h1>
                        <p className="text-slate-500 font-medium mt-1">Select your travel dates to begin the secure checkout process.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                        <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure 256-bit Encrypted</span>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        selectable={true}
                        events={events}
                        select={handleDateSelect}
                        height="auto"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                        eventClassNames="cursor-pointer border-none rounded-lg px-2 py-0.5 font-bold text-[10px]"
                    />
                </div>
            </div>

            {/* MODAL OVERLAY */}
            {showRoomModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex bg-indigo-600 w-14 h-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-indigo-200">
                                    <CalendarIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Available Accommodations</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{selectedDates?.checkIn}</span>
                                        <ArrowRightIcon className="w-3 h-3 text-slate-300" />
                                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{selectedDates?.checkOut}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-4 hover:bg-white hover:shadow-md rounded-2xl transition-all group">
                                <XMarkIcon className="w-6 h-6 text-slate-400 group-hover:text-rose-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loadingRooms ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2rem]"></div>
                                ))
                            ) : availableRooms.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <div className="text-slate-300 mb-4 flex justify-center"><CalendarIcon className="w-16 h-16" /></div>
                                    <p className="text-slate-400 font-black uppercase text-sm tracking-widest">No vacancy for selected duration</p>
                                </div>
                            ) : (
                                availableRooms.map(room => (
                                    <div key={room._id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg tracking-widest">
                                                {room.type}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-slate-900">₹{room.price}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Final Price</p>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Suite {room.roomNumber}</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed flex-1 italic">
                                            "{room.description || "Premium bedding, climate control, and luxury bath amenities included."}"
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            <button
                                                onClick={() => processPayment(room, "PAY_LATER")}
                                                className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group"
                                            >
                                                <BanknotesIcon className="w-5 h-5 text-slate-400 mb-1 group-hover:text-slate-600" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hold Room</span>
                                            </button>
                                            <button
                                                onClick={() => processPayment(room, "PAY_NOW")}
                                                className="flex flex-col items-center justify-center py-4 bg-indigo-600 rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 group"
                                            >
                                                <CreditCardIcon className="w-5 h-5 text-white mb-1" />
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Instant Pay</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}