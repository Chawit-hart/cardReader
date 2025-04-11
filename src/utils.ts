import * as iconv from 'iconv-lite'

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const decodeThai = (buffer: Buffer): string => {
  return iconv
    .decode(buffer, "tis620")
    .replace(/\x00+/g, "")
    .replace(/#+/g, " ")
    .replace(/[^\u0E00-\u0E7F\u0020-\u007E]/g, "")
    .trim();
};

export const formatDate = (dateStr: string): string => {
  if (dateStr.length === 8) {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const monthIndex = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = dateStr.substring(6, 8);

    if (monthIndex < 0 || monthIndex > 11) return "-";
    return `${day} ${MONTHS[monthIndex]} ${year}`;
  }
  return "-";
};

export const formatGender = (gender: string): string => {
  return gender === "1" ? "ชาย" : gender === "2" ? "หญิง" : "ไม่ระบุ";
};

export interface FullName {
  title: string;
  firstname: string;
  lastname: string;
}

export const splitFullName = (fullName: string): FullName => {
  if (!fullName || typeof fullName !== "string") {
    return { title: "-", firstname: "-", lastname: "-" };
  }

  const parts = fullName.trim().replace(/\s+/g, " ").split(" ");
  const titles = ["นาย", "นาง", "นางสาว", "Mr.", "Miss", "Ms.", "Mrs."];

  let title = parts[0];
  if (!titles.includes(title)) {
    title = "-";
  } else {
    parts.shift();
  }

  if (parts.length < 2) return { title, firstname: parts.join(" "), lastname: "-" };

  const lastname = parts.pop()!;
  const firstname = parts.join(" ");

  return { title, firstname, lastname };
};
