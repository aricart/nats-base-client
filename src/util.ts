/*
 * Copyright 2018-2020 The NATS Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//@ts-ignore
import { DataBuffer } from "./databuffer.ts";

export const MSG =
  /^MSG\s+([^\s\r\n]+)\s+([^\s\r\n]+)\s+(([^\s\r\n]+)[^\S\r\n]+)?(\d+)\r\n/i;
export const OK = /^\+OK\s*\r\n/i;
export const ERR = /^-ERR\s+('.+')?\r\n/i;
export const PING = /^PING\r\n/i;
export const PONG = /^PONG\r\n/i;
export const INFO = /^INFO\s+([^\r\n]+)\r\n/i;

export const CR_LF = "\r\n";
export const CR_LF_LEN = CR_LF.length;
export const CRLF: ArrayBuffer = DataBuffer.fromAscii(CR_LF);
export const CR = new Uint8Array(CRLF)[0]; // 13
export const LF = new Uint8Array(CRLF)[1]; // 10

export function isArrayBuffer(a: any): boolean {
  return a instanceof ArrayBuffer;
}

export function protoLen(a: ArrayBuffer): number {
  let ba = new Uint8Array(a);
  for (let i = 0; i < ba.byteLength; i++) {
    let n = i + 1;
    if (ba.byteLength > n && ba[i] === CR && ba[n] === LF) {
      return n + 1;
    }
  }
  return -1;
}

export function extractProtocolMessage(a: ArrayBuffer): string {
  // protocol messages are ascii, so Uint8Array
  let len = protoLen(a);
  if (len) {
    let ba = new Uint8Array(a);
    let small = ba.slice(0, len);
    // @ts-ignore
    return String.fromCharCode.apply(null, small);
  }
  return "";
}

export function buildMessage(protocol: string, a?: ArrayBuffer): Uint8Array {
  let msg = DataBuffer.fromAscii(protocol);
  if (a) {
    msg = DataBuffer.concat(msg, a, CRLF);
  }
  return new Uint8Array(msg);
}

export function extend(a: any, ...b: any[]): any {
  for (let i = 0; i < b.length; i++) {
    let o = b[i];
    Object.keys(o).forEach(function (k) {
      a[k] = o[k];
    });
  }
  return a;
}

export function settle(a: any[]): Promise<any[]> {
  if (Array.isArray(a)) {
    return Promise.resolve(a).then(_settle);
  } else {
    return Promise.reject(
      new TypeError("argument requires an array of promises"),
    );
  }
}

function _settle(a: any[]): Promise<any> {
  return Promise.all(a.map((p) => {
    return Promise.resolve(p).then(_resolve, _resolve);
  }));
}

function _resolve(r: any): any {
  return r;
}

export interface Pending {
  pending: number;
  write: (c: number) => void;
  wrote: (c: number) => void;
  err: (err: Error) => void;
  close: () => void;
  promise: () => Promise<any>;
  resolved: boolean;
  done: boolean;
}

export function pending(): Pending {
  const v = {} as Pending;
  const promise = new Promise((resolve, reject) => {
    v.promise = () => {
      return promise;
    };
    v.write = (c: number) => {
      if (v.resolved) {
        return;
      }
      v.pending += c;
    };
    v.wrote = (c: number) => {
      if (v.resolved) {
        return;
      }
      v.pending -= c;
      if (v.done && 0 >= v.pending) {
        resolve();
      }
    };
    v.close = () => {
      v.done = true;
      if (v.pending === 0) {
        resolve();
      }
    };
    v.err = (err) => {
      v.pending = 0;
      v.resolved = true;
      v.close();
    };
  });
  return v;
}

export function render(frame: Uint8Array): string {
  const cr = "␍";
  const lf = "␊";
  return new TextDecoder().decode(frame)
    .replace(/\n/g, lf)
    .replace(/\r/g, cr);
}
