const ENV_API_GETDATE = import.meta.env.VITE_PDA_API_GETDATE_URL;
/**
 * @typedef {"YYYY-MM-DD"|"YYYY-MM-DD HH:DD:SS"|"YYYY-MM-DD HH:DD:SS.SSS"|"YYYY"|"MM"|"DD"|"HH:DD"|"HH:DD:SS"|"HH:DD:SS.000"} DateTimeFormat
 */
/**
 * @typedef {Object} UseFetchDateTimeParams
 * @property {DateTimeFormat} format - 반환 받을 서버 날짜 정보의 형식
 * @property {boolean} [isUsePublicConfig=true] - 공용 설정 사용 여부
 */
/**
 * @name useFetchDateTime
 * @param {UseFetchDateTimeParams} params
 * @returns {Promise<string>}
 * @author sj_hong
 * @updated 2025-05-08
 * @description
 * - 기본 반환 결과 형식 : YYYY-MM-DD HH:MM:SS
 * - 기본 반환 결과 예시 : 2025-02-28 10:01:20
 * - YYYY-MM-DD: 년-월-일
 * - YYYY-MM-DD HH:DD:SS: 년-월-일 시:분:초
 * - YYYY-MM-DD HH:DD:SS.SSS: 년-월-일 시:분:초.밀리초
 * - YYYY: 년
 * - MM: 월
 * - DD: 일
 * - HH:DD: 시:분
 * - HH:DD:SS: 시:분:초
 * - HH:DD:SS.000: 시:분:초.밀리초
 */
export default async function useFetchDateTime({format, isUsePublicConfig = false}) {
    try {

        // isUseConfigApi 플래그 값에 따라 api 사용 변경 가능
        /*
        const apiUrl = 
            isUsePublicConfig === true 
            ? window.PDA_API_INFOMATION.DATETIME_URL // public 동적 api 주소
            : API_GETDATE_ENV // env 정적 api 주소
        */        

        const response = await fetch( ENV_API_GETDATE ,{
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // 데이트타임은 할당값 없음
        });
        const data = await response.json();
        const result = data[0].value;

        if (!format) {
            console.warn(`[ACS] useFetchDateTime use wrong format parameter`)
            return result;
        }

        const date = new Date(result); // 문자열을 Date 객체로 변환

        if (isNaN(date)) { // 유효한 날짜인지 확인
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
    catch (err) {
        console.error(`${err}`);
        return null;
    }
}
/**************************************************************************************************************************
          .         .                                                                                                      
         ,8.       ,8.                   .8.          b.             8 8 8888      88          .8.          8 8888         
        ,888.     ,888.                 .888.         888o.          8 8 8888      88         .888.         8 8888         
       .`8888.   .`8888.               :88888.        Y88888o.       8 8 8888      88        :88888.        8 8888         
      ,8.`8888. ,8.`8888.             . `88888.       .`Y888888o.    8 8 8888      88       . `88888.       8 8888         
     ,8'8.`8888,8^8.`8888.           .8. `88888.      8o. `Y888888o. 8 8 8888      88      .8. `88888.      8 8888         
    ,8' `8.`8888' `8.`8888.         .8`8. `88888.     8`Y8o. `Y88888o8 8 8888      88     .8`8. `88888.     8 8888         
   ,8'   `8.`88'   `8.`8888.       .8' `8. `88888.    8   `Y8o. `Y8888 8 8888      88    .8' `8. `88888.    8 8888         
  ,8'     `8.`'     `8.`8888.     .8'   `8. `88888.   8      `Y8o. `Y8 ` 8888     ,8P   .8'   `8. `88888.   8 8888         
 ,8'       `8        `8.`8888.   .888888888. `88888.  8         `Y8o.`   8888   ,d8P   .888888888. `88888.  8 8888         
,8'         `         `8.`8888. .8'       `8. `88888. 8            `Yo    `Y88888P'   .8'       `8. `88888. 8 888888888888 
**************************************************************************************************************************/
/******************************************************************************************
사용예시1. function을 사용하여 변수에 저장
-------------------------------------------------------------------------------------------
    
    import useFetchDateTime from "./useFetchDateTime";

    async function fetchAndStoreDateTime() {
        const dateTime = await useFetchDateTime(); // 비동기 데이터 변수에 저장
        console.log("현재 날짜 및 시간:", dateTime); 
    }

    fetchAndStoreDateTime();

******************************************************************************************/
/******************************************************************************************
사용예시2.const함수를 사용하여 변수에 저장
-------------------------------------------------------------------------------------------
    
    import useFetchDateTime from "./useFetchDateTime";

    const fetchAndStoreDateTime = async () => {
        const dateTime = await useFetchDateTime(); // 비동기 데이터 변수에 저장
        console.log("현재 날짜 및 시간:", dateTime); 
    };

    fetchAndStoreDateTime();

******************************************************************************************/
/******************************************************************************************
사용예시3.내부 비동기 코드를 함수에 적용
-------------------------------------------------------------------------------------------
    
    import useFetchDateTime from "./useFetchDateTime";

    const fetchAndStoreDateTime3 = () => {
        (async () => { 
            const dateTime = await cat.useFetchDateTime(); 
            setDateTimeState(dateTime)
            console.log("현재 날짜 및 시간:", dateTime); 
        })();
    };

    fetchAndStoreDateTime();

******************************************************************************************/
/******************************************************************************************
사용예시4. .then()을 사용하여 변수에 저장 
-------------------------------------------------------------------------------------------

    import useFetchDateTime from "./useFetchDateTime";

    async function fetchAndStoreDateTime() {
        useFetchDateTime().then((dateTime) => {
            console.log("현재 날짜 및 시간:", dateTime);
        });
    }

    fetchAndStoreDateTime();

******************************************************************************************/