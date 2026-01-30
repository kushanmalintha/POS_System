export const printReceipt = () => {
  const content = document.querySelector('.receipt-paper');
  if (!content) return;

  const printWindow = window.open('', '', 'width=400,height=600');

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <link rel="stylesheet" href="/receiptPrint.css" />
      </head>
      <body>
        ${content.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};
