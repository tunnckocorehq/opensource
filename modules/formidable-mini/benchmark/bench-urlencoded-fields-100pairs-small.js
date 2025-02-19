'use strict';

const buffers = [
  Buffer.from(
    Array.from({ length: 100 })
      .fill('')
      .map((_, i) => `key${i}=value${i}`)
      .join('&'),
  ),
];
const calls = {
  field: 0,
  end: 0,
};

let n = 3e3;

const moduleName = process.argv[2];
switch (moduleName) {
  case 'busboy': {
    const busboy = require('busboy');

    console.time(moduleName);
    (function next() {
      const parser = busboy({
        limits: {
          fieldSizeLimit: Number.POSITIVE_INFINITY,
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      });
      parser
        .on('field', (name, val, info) => {
          ++calls.field;
        })
        .on('close', () => {
          ++calls.end;
          if (--n === 0) console.timeEnd(moduleName);
          else process.nextTick(next);
        });

      for (const buf of buffers) parser.write(buf);
      parser.end();
    })();
    break;
  }

  case 'formidable': {
    const QuerystringParser = require('formidable/src/parsers/Querystring.js');

    console.time(moduleName);
    (function next() {
      const parser = new QuerystringParser();
      parser
        .on('data', (obj) => {
          ++calls.field;
        })
        .on('end', () => {
          ++calls.end;
          if (--n === 0) console.timeEnd(moduleName);
          else process.nextTick(next);
        });

      for (const buf of buffers) parser.write(buf);
      parser.end();
    })();
    break;
  }

  case 'formidable-streaming': {
    const QuerystringParser = require('formidable/src/parsers/StreamingQuerystring.js');

    console.time(moduleName);
    (function next() {
      const parser = new QuerystringParser();
      parser
        .on('data', (obj) => {
          ++calls.field;
        })
        .on('end', () => {
          ++calls.end;
          if (--n === 0) console.timeEnd(moduleName);
          else process.nextTick(next);
        });

      for (const buf of buffers) parser.write(buf);
      parser.end();
    })();
    break;
  }

  default:
    if (moduleName === undefined) console.error('Missing parser module name');
    else console.error(`Invalid parser module name: ${moduleName}`);
    process.exit(1);
}
