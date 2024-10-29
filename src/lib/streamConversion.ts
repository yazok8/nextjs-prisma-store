// src/lib/streamConversion.ts

import { Readable } from 'stream';

/**
 * Converts a Web API ReadableStream to a Node.js Readable stream.
 * @param webReadable - The Web API ReadableStream to convert.
 * @returns A Node.js Readable stream.
 */
export function webToNodeReadable(webReadable: ReadableStream<Uint8Array>): Readable {
  const reader = webReadable.getReader();
  const nodeReadable = new Readable({
    read() {} // _read is required but you can noop it
  });

  function pump() {
    reader.read().then(({ done, value }) => {
      if (done) {
        nodeReadable.push(null); // No more data
        return;
      }
      nodeReadable.push(Buffer.from(value));
      pump();
    }).catch(err => {
      nodeReadable.destroy(err);
    });
  }

  pump();

  return nodeReadable;
}
