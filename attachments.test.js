import test from 'node:test';
import assert from 'node:assert/strict';
import {buildEml,validTechnicalSheet} from './core.js';
test('EML contains recoverable PDF and UTF-8 body, with safe headers',()=>{
 const pdf='%PDF-1.4\nexample';const f={name:'Scène.pdf',size:pdf.length,data:btoa(pdf)};
 assert.ok(validTechnicalSheet(f));
 const mail=buildEml('Devis été','Bonjour Sébastien','bad\r\nBcc: x@y.fr',[f]);
 assert.ok(mail.includes(f.data));assert.ok(mail.includes("filename*=UTF-8''Sc%C3%A8ne.pdf"));assert.ok(!mail.includes('Bcc:'));
 assert.ok(mail.includes(Buffer.from('Bonjour Sébastien').toString('base64')));
 assert.equal((mail.match(/Content-Disposition: attachment/g)||[]).length,1);
 assert.throws(()=>buildEml('x','x','',[{...f,data:'oops'}]));
});
