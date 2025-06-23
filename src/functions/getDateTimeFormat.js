/**
 * 주어진 날짜를 특정 형식으로 변환하는 함수
 * @param {"YYYY-MM-DD"|"YYYY-MM-DD HH:DD:SS"|"YYYY-MM-DD HH:DD:SS.SSS"|"YYYY"|"MM"|"DD"|"HH:DD"|"HH:DD:SS"|"HH:DD:SS.000"} format - 반환할 날짜 형식
 * @param {string|number|Date} dateInput - 변환할 날짜 (문자열, 타임스탬프, Date 객체 허용)
 * @returns {string} 변환된 날짜 문자열
 * @author sj_hong 
 * @updated 2025-03-21 08:49:00
 * @example
 * getDateTimeFormat("YYYY-MM-DD", "2025-03-21"); // "2025-03-21"
 * getDateTimeFormat("YYYY-MM-DD HH:DD:SS", 1672531200000); // "2023-01-01 00:00:00"
 * getDateTimeFormat("HH:DD:SS", new Date()); // "14:30:45"
 * getDateTimeFormat("YYYY", "March 21, 2025"); // "2025"
 * getDateTimeFormat("MM", "2025-03-21T14:30:45Z"); // "03"
 * getDateTimeFormat("DD", 1672531200000); // "01"
 * getDateTimeFormat("HH:DD:SS.000", "2025-03-21T14:30:45.123Z"); // "14:30:45.123"
 * getDateTimeFormat("YYYY-MM-DD HH:DD:SS", "Fri, 21 Mar 2025 14:30:45 GMT"); // "2025-03-21 14:30:45"
 */
export default function getDateTimeFormat(format, dateInput) {
    
    let date;

    if (dateInput instanceof Date) {
        date = dateInput;
    } 
    else if (!isNaN(dateInput)) {
        date = new Date(parseInt(dateInput));
    } 
    else if (typeof dateInput === 'string') {
        // 한국어 날짜 형식 처리
        const koreanTimeMatch = dateInput.match(/(\d{4})-(\d{2})-(\d{2})\s(오전|오후)\s(\d{1,2}):(\d{2}):(\d{2})/);
        if (koreanTimeMatch) {
            const year = parseInt(koreanTimeMatch[1]);
            const month = parseInt(koreanTimeMatch[2]) - 1; // Month is 0-indexed
            const day = parseInt(koreanTimeMatch[3]);
            const ampm = koreanTimeMatch[4];
            let hour = parseInt(koreanTimeMatch[5]);
            const minute = parseInt(koreanTimeMatch[6]);
            const second = parseInt(koreanTimeMatch[7]);

            if (ampm === '오후' && hour !== 12) {
                hour += 12;
            } 
            else if (ampm === '오전' && hour === 12) {
                hour = 0;
            }

            date = new Date(year, month, day, hour, minute, second);
        } 
        else {
            date = new Date(dateInput);
        }
    }
    else {
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

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

// 예제 실행
/* 

console.log(getDateTimeFormat("YYYY-MM-DD", "2025-03-21")); // "2025-03-21"
console.log(getDateTimeFormat("YYYY-MM-DD HH:DD:SS", 1672531200000)); // "2023-01-01 00:00:00"
console.log(getDateTimeFormat("HH:DD:SS", new Date())); // 현재 시간
console.log(getDateTimeFormat("YYYY", "March 21, 2025")); // "2025"
console.log(getDateTimeFormat("MM", "2025-03-21T14:30:45Z")); // "03"
console.log(getDateTimeFormat("DD", 1672531200000)); // "01"
console.log(getDateTimeFormat("HH:DD:SS.000", "2025-03-21T14:30:45.123Z")); // "14:30:45.123"
console.log(getDateTimeFormat("YYYY-MM-DD HH:DD:SS", "Fri, 21 Mar 2025 14:30:45 GMT")); // "2025-03-21 14:30:45"

*/
