import pcsclite from "pcsclite";
import { SELECT_THAI_ID_CARD } from "./apdu";
import { readCardData } from "./handlers";
import type { CardReader } from "pcsclite";
import type { Buffer } from "buffer";

const pcsc = pcsclite();

const disconnectAsync = (reader: CardReader): Promise<void> => {
  return new Promise((resolve, reject) => {
    reader.disconnect(reader.SCARD_UNPOWER_CARD, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const connectAsync = (reader: CardReader): Promise<number> => {
  return new Promise((resolve, reject) => {
    reader.connect(
      { share_mode: reader.SCARD_SHARE_SHARED, protocol: reader.SCARD_PROTOCOL_T0 },
      (err, protocol) => {
        if (err) reject(err);
        else resolve(protocol);
      }
    );
  });
};

const transmitAsync = (reader: CardReader, command: Buffer, protocol: number): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    reader.transmit(command, 255, protocol, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};

const handleCardInsert = async (reader: CardReader): Promise<void> => {
  try {
    await disconnectAsync(reader);
    const protocol = await connectAsync(reader);
    await transmitAsync(reader, SELECT_THAI_ID_CARD, protocol);
    readCardData(reader, protocol);
  } catch (error: any) {
    console.error("❌ เกิดข้อผิดพลาด:", error.message);
  }
};

const initializeReader = (): void => {
  pcsc.on("reader", (reader: CardReader) => {
    console.log(`🔍 พบเครื่องอ่านบัตร: ${reader.name}`);

    reader.on("status", async (status) => {
      if ((status.state & reader.SCARD_STATE_PRESENT) && !(reader.state & reader.SCARD_STATE_PRESENT)) {
        console.log("✅ บัตรถูกเสียบแล้ว");
        await handleCardInsert(reader);
      }
    });
  });
};

export { initializeReader };
