import { useState } from "react";
import { uploadScannedDoc } from "../../api/scannedDocument.api";

export default function UploadScannedDoc({ bookingId }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("ID_PROOF");

  const submit = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookingId", bookingId);
    formData.append("documentType", type);
    formData.append("uploadedBy", "Front Desk");
    formData.append("source", "ONLINE");

    await uploadScannedDoc(formData);
    alert("Document uploaded");
  };

  return (
    <div className="p-6">
      <select onChange={e => setType(e.target.value)}>
        <option>ID_PROOF</option>
        <option>CHECKIN_FORM</option>
        <option>PAYMENT_PROOF</option>
      </select>

      <input type="file" onChange={e => setFile(e.target.files[0])} />

      <button onClick={submit} className="btn-primary mt-2">
        Upload
      </button>
    </div>
  );
}
