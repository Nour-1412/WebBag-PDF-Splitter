const pdfInput = document.getElementById("pdfInput");
const fileInfo = document.getElementById("fileInfo");
const controls = document.getElementById("controls");

const startPage = document.getElementById("startPage");
const endPage = document.getElementById("endPage");

const splitBtn = document.getElementById("splitBtn");

const statusBox = document.getElementById("statusBox");
const downloadBtn = document.getElementById("downloadBtn");

let selectedFile = null;
let totalPages = 0;

pdfInput.addEventListener("change", async (e) => {

  selectedFile = e.target.files[0];

  if (!selectedFile) return;

  try {

    const bytes = await selectedFile.arrayBuffer();

    const pdfDoc = await PDFLib.PDFDocument.load(bytes);

    totalPages = pdfDoc.getPageCount();

    fileInfo.style.display = "block";

    fileInfo.innerHTML =
      `
      <strong>اسم الملف:</strong> ${selectedFile.name}
      <br><br>
      <strong>عدد الصفحات:</strong> ${totalPages}
      `;

    controls.style.display = "block";

    startPage.value = 1;
    endPage.value = totalPages;

    downloadBtn.style.display = "none";
    statusBox.style.display = "none";

  } catch (error) {

    alert("تعذر قراءة ملف PDF.");

    console.error(error);
  }
});

splitBtn.addEventListener("click", async () => {

  if (!selectedFile) {
    alert("يرجى اختيار ملف PDF أولاً.");
    return;
  }

  const start = parseInt(startPage.value);
  const end = parseInt(endPage.value);

  if (
    isNaN(start) ||
    isNaN(end) ||
    start < 1 ||
    end > totalPages ||
    start > end
  ) {

    alert(
      `يرجى إدخال نطاق صحيح بين 1 و ${totalPages}`
    );

    return;
  }

  splitBtn.disabled = true;
  splitBtn.textContent = "جاري استخراج الصفحات...";

  statusBox.style.display = "block";
  statusBox.style.background = "#eff6ff";
  statusBox.style.color = "#1d4ed8";
  statusBox.textContent = "يرجى الانتظار...";

  try {

    const originalBytes =
      await selectedFile.arrayBuffer();

    const originalPdf =
      await PDFLib.PDFDocument.load(originalBytes);

    const newPdf =
      await PDFLib.PDFDocument.create();

    const pageIndexes = [];

    for (let i = start - 1; i <= end - 1; i++) {
      pageIndexes.push(i);
    }

    const copiedPages =
      await newPdf.copyPages(
        originalPdf,
        pageIndexes
      );

    copiedPages.forEach(page => {
      newPdf.addPage(page);
    });

    const pdfBytes =
      await newPdf.save();

    const blob =
      new Blob(
        [pdfBytes],
        { type: "application/pdf" }
      );

    const url =
      URL.createObjectURL(blob);

    downloadBtn.href = url;

    downloadBtn.download =
      `webbag-pages-${start}-${end}.pdf`;

    downloadBtn.style.display = "block";

    statusBox.style.background = "#ecfdf5";
    statusBox.style.color = "#166534";

    statusBox.textContent =
      `تم استخراج ${end - start + 1} صفحة بنجاح`;

  } catch (error) {

    statusBox.style.background = "#fef2f2";
    statusBox.style.color = "#dc2626";

    statusBox.textContent =
      "حدث خطأ أثناء معالجة الملف.";

    console.error(error);
  }

  splitBtn.disabled = false;
  splitBtn.textContent = "استخراج الصفحات";
});
