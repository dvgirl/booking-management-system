import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { getBookings, createBooking, checkAvailability } from "../../api/booking.api";
import { initiateCashfreePayment, verifyCashfreePayment } from '../../api/transaction.api';
import { toast } from "react-toastify";
import { load } from "@cashfreepayments/cashfree-js";
import {
    CreditCardIcon,
    BanknotesIcon,
    CalendarIcon,
    XMarkIcon,
    CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function UserBookingCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [selectedDates, setSelectedDates] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [cashfree, setCashfree] = useState(null);
    const [cashfreeReady, setCashfreeReady] = useState(false);

    useEffect(() => {
        const initCashfree = async () => {
            const instance = await load({ mode: "sandbox" }); // Use "production" for live
            setCashfree(instance);
            setCashfreeReady(true);
        };
        initCashfree();
        loadMyBookings();
    }, []);



    const loadMyBookings = async () => {
        try {
            setLoading(true);
            const res = await getBookings(); // Backend: filter.userId = id;
            const mapped = res.data.map(b => ({
                id: b._id,
                title: `Room ${b.roomId?.roomNumber} (${b.status})`,
                start: b.checkIn,
                end: b.checkOut,
                backgroundColor: b.status === "CONFIRMED" ? "#10b981" : "#f59e0b",
                borderColor: "transparent"
            }));
            setEvents(mapped);
        } catch (err) {
            toast.error("Could not load your bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = async (info) => {
        const checkIn = info.startStr;
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
        } finally {
            setLoadingRooms(false);
        }
    };
    // --- PAYMENT GATEWAY INTEGRATION ---
    const processPayment = async (room, method) => {
        if (method !== "PAY_NOW") return;

        if (!cashfree) {
            toast.error("Payment system still loading, please wait...");
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
            // In your backend, ensure you also return the custom orderId you generated
            let checkoutOptions = {
                paymentSessionId: cf_token,
                redirectTarget: "_modal", // Use _modal for popup flow
            };

            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    console.log("Payment Error:", result.error);
                    toast.error(result.error.message || "Payment cancelled");
                    return;
                }

                // If the flow reaches here, even without 'redirect', 
                // the user finished the attempt. Now verify.
                verifyPaymentOnServer(order_id);
            });

        } catch (err) {
            console.error("Payment error:", err);
            toast.error("Payment failed. Try again.");
        }
    };

    const verifyPaymentOnServer = async (orderId) => {
        try {
            const verifyRes = await verifyCashfreePayment({ orderId: orderId });
            if (verifyRes.data.paymentStatus === "SUCCESS") {
                toast.success("Booking Confirmed!");
                loadMyBookings();
                closeModal();
            } else {
                toast.warning("Payment status: " + verifyRes.data.paymentStatus);
            }
        } catch (err) {
            toast.error("Verification failed. Please check your bookings later.");
        }
    };
    const closeModal = () => {
        setShowRoomModal(false);
        setSelectedDates(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reserve Your Stay</h1>
                        <p className="text-slate-500">Select dates on the calendar to see available luxury suites.</p>
                    </div>
                    <div className="flex gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 px-3 border-r">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs font-bold text-slate-600">Confirmed</span>
                        </div>
                        <div className="flex items-center gap-2 px-3">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-xs font-bold text-slate-600">Pending</span>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        selectable={true}
                        events={events}
                        select={handleDateSelect}
                        height="auto"
                        headerToolbar={{
                            left: 'today prev,next',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                    />
                </div>
            </div>

            {/* Room Selection & Payment Modal */}
            {showRoomModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[999] p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 2: Choose Room</h2>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                        {selectedDates?.checkIn} — {selectedDates?.checkOut}
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <XMarkIcon className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            {loadingRooms ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>)}
                                </div>
                            ) : availableRooms.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold text-lg">No rooms available for these dates.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {availableRooms.map(room => (
                                        <div key={room._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg">
                                                        {room.type}
                                                    </span>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-slate-900">₹{room.price}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Per Night</p>
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 mb-2">Room {room.roomNumber}</h3>
                                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{room.description || "Luxury amenities with a scenic view and premium bedding."}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <button
                                                    onClick={() => processPayment(room, "PAY_LATER")}
                                                    className="flex flex-col items-center justify-center py-3 px-2 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group"
                                                >
                                                    <BanknotesIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 mb-1" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">Pay at Desk</span>
                                                </button>
                                                <button
                                                    onClick={() => processPayment(room, "PAY_NOW")}
                                                    className="flex flex-col items-center justify-center py-3 px-2 bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                                >
                                                    <CreditCardIcon className="w-5 h-5 text-white mb-1" />
                                                    <span className="text-[10px] font-black text-white uppercase">Pay Now</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}