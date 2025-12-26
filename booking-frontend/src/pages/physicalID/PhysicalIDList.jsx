import { useEffect, useState } from "react";
import { getAllPhysicalIDs } from "../../api/physicalID.api";

export default function PhysicalIDList() {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getAllPhysicalIDs();
    setIds(res.data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Physical IDs</h2>
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th>Booking</th>
            <th>ID Type</th>
            <th>ID Number</th>
            <th>Verified By</th>
            <th>Verified At</th>
          </tr>
        </thead>
        <tbody>
          {ids.map(id => (
            <tr key={id._id}>
              <td>{id.bookingId._id}</td>
              <td>{id.idType}</td>
              <td>{id.idNumber}</td>
              <td>{id.verifiedBy}</td>
              <td>{new Date(id.verifiedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
