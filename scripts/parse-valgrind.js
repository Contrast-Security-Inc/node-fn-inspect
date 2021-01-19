'use strict';

const convert = require('xml-js');
const fs = require('fs');

const xml = fs.readFileSync('./valgrind.xml');
const targetNames = [];
JSON.parse(fs.readFileSync('./binding.gyp')).targets.forEach((target) => {
  targetNames.push(target.target_name);
});
const result = JSON.parse(convert.xml2json(xml, { compact: true }));
const relatedErrors = result.valgrindoutput.error.filter((err) => {
  let match = false;
  err.stack.frame.forEach((frame) => {
    targetNames.forEach((targetName) => {
      if (frame.obj && frame.obj._text.indexOf(`${targetName}.node`) !== -1) {
        match = true;
      }
    });
  });
  return match;
});

if (relatedErrors.length > 0) {
  console.log('UNEXPECTED VALGRIND ERRORS');
  console.log(JSON.stringify(relatedErrors, null, 4));
  // eslint-disable-next-line no-process-exit
  process.exit(-1);
} else {
  console.log('valgrind output clean');
}
