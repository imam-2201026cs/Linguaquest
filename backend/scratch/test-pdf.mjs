import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const lib = require('pdf-parse');
const PDFParse = lib.PDFParse;
console.log('PDFParse type:', typeof PDFParse);
const instance = new PDFParse();
console.log('instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
