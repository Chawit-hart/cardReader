declare module "pcsclite" {
  import { EventEmitter } from "events";
  import { Buffer } from "buffer";

  export interface CardReader extends EventEmitter {
    name: string;
    state: number;

    SCARD_STATE_PRESENT: number;
    SCARD_SHARE_SHARED: number;
    SCARD_PROTOCOL_T0: number;
    SCARD_UNPOWER_CARD: number;
    SCARD_LEAVE_CARD: number;


    connect(
      options: { share_mode: number; protocol: number },
      cb: (err: Error | null, protocol: number) => void
    ): void;

    disconnect(mode: number, cb: (err: Error | null) => void): void;

    transmit(
      input: Buffer,
      length: number,
      protocol: number,
      cb: (err: Error | null, data: Buffer) => void
    ): void;

    on(event: "status", listener: (status: { state: number }) => void): this;
  }

  export interface PCSCLite extends EventEmitter {
    on(event: "reader", listener: (reader: CardReader) => void): this;
  }

  export default function pcsclite(): PCSCLite;
}
