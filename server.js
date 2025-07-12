const express = require("express");
const fs = require("fs");

const PDFDocument = require("pdfkit");

const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const pdfDir = path.join(__dirname, "pdfs");
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir);
}

app.post("/generate-pdf", (req, res) => {
  const data = req.body;
  const doc = new PDFDocument();

  const fileName = `report_${Date.now()}.pdf`;
  const filePath = path.join(pdfDir, fileName);

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.image("nodejs-frameworks.png", 50, 50, { width: 100 });

  doc.fontSize(20).text(data.title || "No Title Provided", 50, 150);
  doc.fontSize(14).text(`Name: ${data.name || "Unknown"}`, 50, 200);
  doc.text(`Description: ${data.description || "No description"}`, 50, 250);

  if (data.extraNotes) {
    doc.moveDown().fontSize(12).text(`Notes:${data.extraNotes}`);
  }
  doc.end();

  writeStream.on("finish", () => {
    res.json({ message: "PDF Generated", filePath: `/pdfs/${fileName}` });
  });

  writeStream.on("error", (err) => {
    console.log(err);
    res.status(500).json({ error: "failed to generate PDF" });
  });
  
});
app.use("/pdfs", express.static(pdfDir));
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
