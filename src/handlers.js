const { APDU_COMMANDS, CMD_GET_RESPONSE } = require("./apdu");
const { decodeThai, formatDate, formatGender, splitFullName } = require("./utils");

const readCardData = (reader, protocol) => {
  const keys = Object.keys(APDU_COMMANDS);
  let index = 0;

  function next() {
    if (index >= keys.length) {
      reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
        if (err) console.error("❌ Disconnect Error:", err.message);
        else console.log("🔒 ยกเลิกการเชื่อมต่อสำเร็จ");
      });
      return;
    }

    const key = keys[index++];
    const label = getLabel(key);
    const cmd = APDU_COMMANDS[key];

    reader.transmit(cmd, 255, protocol, (err, data) => {
      if (err) return console.error(`❌ อ่านข้อมูล ${label} ไม่สำเร็จ:`, err.message);
      handleResponse(reader, protocol, data, getExpectedLength(key), label, key, next);
    });
  }

  next();
};

const handleResponse = async (reader, protocol, data, expectedLength, label, key, callback) => {
  try {
    let value;
    if (data[data.length - 2] === 0x61) {
      const response = await transmitAsync(reader, CMD_GET_RESPONSE(data[data.length - 1]), protocol);
      value = decodeThai(response.slice(0, expectedLength));
    } else {
      value = decodeThai(data.slice(0, expectedLength));
    }

    value = formatData(value, key);
    printFormattedData(label, key, value);

    if (callback) callback();
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการอ่าน ${label}:`, error.message);
  }
};

const printFormattedData = (label, key, value) => {
  console.log(`${label}:`);
  if (["fullNameThai", "fullNameEng"].includes(key)) {
    console.log(`   🏷 Title: ${value.title || "-"}`);
    console.log(`   🏷 Firstname: ${value.firstname || "-"}`);
    console.log(`   🏷 Lastname: ${value.lastname || "-"}`);
  } else {
    console.log(`${value || "-"}`);
  }
};



const transmitAsync = (reader, command, protocol) => {
  return new Promise((resolve, reject) => {
    reader.transmit(command, 255, protocol, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};



const formatData = (value, key) => {
  if (key === "birthDate") {
    return value.trim() ? formatDate(value) : "-";
  }
  if (key === "issueDate" || key === "expiryDate") {
    return formatDate(value);
  }
  if (key === "gender") {
    return formatGender(value);
  }
  if (key === "religion") {
    return value.trim() ? value : "-";
  }
  if (key === "fullNameThai" || key === "fullNameEng") {
    return splitFullName(value);
  }
  return value;
};



const getLabel = (key) => ({
  cid: "🆔 เลขบัตรประชาชน",
  fullNameThai: "👤 ชื่อ-นามสกุล (ไทย)",
  fullNameEng: "👤 ชื่อ-นามสกุล (อังกฤษ)",
  birthDate: "🎂 วันเกิด",
  gender: "⚧ เพศ",
  address: "🏠 ที่อยู่",
  issueDate: "📅 วันออกบัตร",
  expiryDate: "⏳ วันหมดอายุ",
  religion: "🛐 ศาสนา",
}[key] || key);

const getExpectedLength = (key) => ({ cid: 13, fullNameThai: 100, birthDate: 8, gender: 1, issueDate: 8, expiryDate: 8 }[key] || 255);

module.exports = { readCardData };
