const PDFDocument = require("pdfkit");
const fs = require("fs");
const QRCode = require("qrcode");

exports.generateBookingConfirmation = async (booking) => {
  const doc = new PDFDocument();
  const filePath = `uploads/docs/booking-${booking._id}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("Booking Confirmation", { align: "center" });
  doc.moveDown();

  doc.text(`Confirmation No: ${booking.confirmationNumber}`);
  doc.text(`Guest Name: ${booking.guestName}`);
  doc.text(`Check-in: ${booking.checkIn.toDateString()}`);
  doc.text(`Check-out: ${booking.checkOut.toDateString()}`);
  doc.text(`Room: ${booking.roomId}`);

  const qrData = await QRCode.toDataURL(booking._id.toString());
  doc.image(qrData, { width: 100 });

  doc.end();

  return filePath;
};
