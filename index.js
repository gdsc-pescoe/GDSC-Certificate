const submitBtn = document.getElementById("submitBtn");
function formatDate(date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

const currentDate = new Date();
const formattedDate = formatDate(currentDate);
const { PDFDocument, rgb, degrees } = PDFLib;

const generatePDF = async (name, skill_boost_url) => {
  // Use a regular expression to match the ID pattern in the URL
  const idMatch = skill_boost_url.match(/\/public_profiles\/([\w-]+)$/);

  let id;
  if (idMatch) {
    id = idMatch[1];
    console.log(id); // This will log the ID: "c5b5d61d-8094-426f-a43c-172a9c704e00"
  } else {
    console.log("ID not found in the URL.");
  }

  const existingPdfBytes = await fetch("../certificate_temp.pdf").then((res) =>
    res.arrayBuffer()
  );

  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  // Get the custom font
  const fontBytes = await fetch("./GoogleSansDisplay-Regular-v1.27.ttf").then(
    (res) => res.arrayBuffer()
  );

  // Embed the custom font in the document
  const SanChezFont = await pdfDoc.embedFont(fontBytes);

  // Get the first page of the document
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Draw the name
  const nameFontSize = 25;
  const nameLineHeight = nameFontSize * 1.2;
  const nameTextHeight = nameLineHeight;
  const pageHeight = firstPage.getHeight();
  const nameTextWidth = name.length * nameFontSize;
  const pageWidth = 842;
  const nameX = (pageWidth - nameTextWidth) / 2;
  const nameY = (pageHeight - nameTextHeight) / 2;

  firstPage.drawText(name, {
    x: 254,
    y: 440,
    size: nameFontSize,
    font: SanChezFont,
    color: rgb(6 / 255, 5 / 255, 5 / 255), // Set color to #060505
  });

  // Draw the grade
  const gradeFontSize = 11.85;
  const gradeX = (pageWidth - nameTextWidth) / 2;
  const gradeY = nameY - 30;
  const gradeText = formattedDate;

  firstPage.drawText(gradeText, {
    x: 254.87,
    y: 477,
    size: gradeFontSize,
    font: SanChezFont,
    color: rgb(140 / 255, 143 / 255, 148 / 255), // Set color to #8C8F94
  });

  // Draw the grade
  const urlFontSize = 8.05;
  const urlText = `gdscpescoe.tech/studyjam/verify/${id}`;
  const urlCodeX = pageWidth - 150; // Adjust the position
  const urlCodeY = 40; // Adjust the position

  firstPage.drawText(urlText, {
    x: 604,
    y: urlCodeY,
    size: urlFontSize,
    font: SanChezFont,
    width: 10,
    color: rgb(103 / 255, 108 / 255, 114 / 255), // Set color to RGB(103, 108, 114)
  });
  // Calculate the position and size for the URL text

  // Fetch the QR code image
  const qrCodeResponse = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://gdscpescoe.tech/studyjam/verify/${id}`
  );
  const qrCodeImageBlob = await qrCodeResponse.blob();

  // Convert the blob to a Uint8Array
  const qrCodeImageData = new Uint8Array(
    await new Response(qrCodeImageBlob).arrayBuffer()
  );

  // Embed the QR code image on the PDF
  const qrCodeImage = await pdfDoc.embedPng(qrCodeImageData);
  const qrCodeWidth = 80; // Set the width of the QR code image
  const qrCodeHeight = 80; // Set the height of the QR code image
  const qrCodeX = pageWidth - qrCodeWidth - 65; // Adjust the position
  const qrCodeY = 70; // Adjust the position
  firstPage.drawImage(qrCodeImage, {
    x: qrCodeX,
    y: qrCodeY,
    width: qrCodeWidth,
    height: qrCodeHeight,
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Create and download the PDF file
  var file = new File([pdfBytes], `${name}_Certificate.pdf`, {
    type: "application/pdf;charset=utf-8",
  });
  saveAs(file);
};
