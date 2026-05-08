const http = require('http');
const req = http.request('http://localhost:3000/api/pdf-to-text', {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data; boundary=---boundary' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});
req.write('-----boundary\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n');
req.write('%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj 2 0 obj <</Type /Pages /Kids [] /Count 0>> endobj xref 0 3 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n trailer <</Size 3 /Root 1 0 R>> startxref 112 %%EOF\r\n');
req.write('-----boundary--\r\n');
req.end();
