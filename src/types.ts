/*
 * Copyright 2020 The NATS Authors
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
import { NatsConnection } from "./nats.ts";

export const CLOSE_EVT = "close";
export const DEFAULT_URL = "nats://localhost:4222";

export interface ConnectFn {
  (opts: ConnectionOptions): Promise<NatsConnection>;
}

export enum Payload {
  STRING = "string",
  JSON = "json",
  BINARY = "binary",
}

export interface ConnectionOptions {
  name?: string;
  noEcho?: boolean;
  pass?: string;
  payload?: Payload;
  pedantic?: boolean;
  timeout?: number;
  token?: string;
  url: string;
  user?: string;
  userJWT?: () => string | string;
  verbose?: boolean;
  debug?: boolean;
  pingInterval?: number;
}

export interface Msg {
  subject: string;
  sid: number;
  reply?: string;
  data?: any;

  respond(data?: any): void;
}

export interface SubscriptionOptions {
  queue?: string;
  max?: number;
}
