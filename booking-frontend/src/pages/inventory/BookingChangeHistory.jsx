export default function BookingChangeHistory({ history }) {
    return (
        <div className="mt-6">
            <h3 className="font-semibold">Change History</h3>

            {history.map((h, i) => (
                <div key={i} className="border p-2 mt-2 rounded">
                    <p><b>Changed By:</b> {h.by}</p>
                    <p><b>Change:</b> {h.change}</p>
                    <p><b>Date:</b> {h.date}</p>
                </div>
            ))}
        </div>
    );
}
