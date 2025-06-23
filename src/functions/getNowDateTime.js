/**
 * 현재 날짜 및 시간을 특정 형식으로 반환하는 함수
 * @param {"YYYY-MM-DD"|"YYYY-MM-DD HH:DD:SS"|"YYYY-MM-DD HH:DD:SS.SSS"|"YYYY"|"MM"|"DD"|"HH:DD"|"HH:DD:SS"|"HH:DD:SS.000"} [format="YYYY-MM-DD HH:DD:SS"] - 반환할 날짜 형식
 * @returns {string} 변환된 날짜 문자열
 * @author sj_hong 
 * @updated 2025-03-21 08:49:00
 * @example
 * getNowDateTime(); // 현재 날짜 및 시간 반환 (기본 형식)
 * getNowDateTime("YYYY-MM-DD"); // "2025-03-21"
 * getNowDateTime("HH:DD:SS"); // "14:30:45"
 */
export default function getNowDateTime(format = "YYYY-MM-DD HH:DD:SS") {
    
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    const formatMap = {
        "YYYY-MM-DD": `${year}-${month}-${day}`,
        "YYYY-MM-DD HH:DD:SS": `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
        "YYYY-MM-DD HH:DD:SS.SSS": `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        "YYYY": `${year}`,
        "MM": `${month}`,
        "DD": `${day}`,
        "HH:DD": `${hours}:${minutes}`,
        "HH:DD:SS": `${hours}:${minutes}:${seconds}`,
        "HH:DD:SS.000": `${hours}:${minutes}:${seconds}.${milliseconds}`,
    };

    return formatMap[format.toUpperCase()] || "Invalid format";
}