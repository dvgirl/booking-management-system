export default function KycPending() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-2">KYC Under Review</h2>
                <p className="text-gray-500">
                    Your documents are being verified.  
                    Please wait for admin approval.
                </p>
            </div>
        </div>
    );
}
