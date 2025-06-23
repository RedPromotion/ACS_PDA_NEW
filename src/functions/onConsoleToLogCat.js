/*****************************************************************
 * @name sendConsoleToLogCat()
 * @variation function
 * @author sj_hong
 * @date 2025-04-07
 * @param {string} consoleType - 로그 유형 ('log', 'warn', 'error').
 * @param {string} message - 메시지.
 * @description
 * - 안드로이드 환경에서 JavascriptInterface 가 준비되어야 동작
 * - 로그 메시지를 안드로이드 Logcat으로 보냅니다.
 */
export const sendConsoleToLogCat = (consoleType, message) => {
    if (window.AndroidNative) {        
        switch (consoleType) {
            case 'log':
            if (window.AndroidNative.logFromReact) {
                window.AndroidNative.logFromReact(message);
            }
            break;
            case 'warn':
            if (window.AndroidNative.warnFromReact) {
                window.AndroidNative.warnFromReact(message);
            }
            break;
            case 'error':
            if (window.AndroidNative.errorFromReact) {
                window.AndroidNative.errorFromReact(message);
            }
            break;
            default:
            if (window.AndroidNative.logFromReact) {
                window.AndroidNative.logFromReact(`[not match Type: ${consoleType.toUpperCase()}] ${message}`);
            }
            break;
        }
    } 
    else {
        console.error('[ACS][AndroidNative Bridge Not Ready]', consoleType, message);
    }
};



/********************************************************************
 * @name sendLogToLogCat()
 * @variation function
 * @author sj_hong
 * @date 2025-04-07
 * @param {*} message 로그 메시지.
 */
export const sendLogToLogCat = (message) => {
    if (window.AndroidNative && window.AndroidNative.logFromReact) {        
        window.AndroidNative.logFromReact(message);            
    } 
    else {
        console.error('[ACS][AndroidNative logFromReact Bridge Not Ready]', message);
    }
};



/********************************************************************
 * @name overrideConsoleFunctionsForLogCat()
 * @variation function
 * @author sj_hong
 * @date 2025-04-07
 * @description
 * - 안드로이드 환경에서 JavascriptInterface 가 준비되어야 동작
 * - console 객체의 log, warn, error 함수를 재정의하여 sendLogToLogCat 함수를 자동으로 호출하도록 설정
 * - 기존 자바스크립트 console 객체 호출을 android LogCat 쪽으로 보냄
 */
export const overrideConsoleFunctionsForLogCat = () => {
    return // 함수 수리 중 ... 
    if(!window.AndroidNative || !window.AndroidNative.logFromReact || !window.AndroidNative.warnFromReact || !window.AndroidNative.errorFromReact){
        console.error(`[ACS] AndroidNative JavaScript interface not Dectected`)
        return
    }
    const originalConsoleLog = console.log;
    console.log = function(message) {
        //일반콘솔추가예정
        originalConsoleLog.apply(console, arguments);
        sendLogToLogCat('log', message);
    };
    const originalConsoleWarn = console.warn;
    console.warn = function(message) {
        //일반콘솔추가예정
        originalConsoleWarn.apply(console, arguments);
        sendLogToLogCat('warn', message);
    };
    const originalConsoleError = console.error;
    console.error = function(message) {
        //일반콘솔추가예정
        originalConsoleError.apply(console, arguments);
        sendLogToLogCat('error', message);
    };
};


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
***************************************************************************************************************************
// sendLogToLogCat 함수 사용 예시
***********************************

// 또는 특정 상황에서만 직접 sendLogToLogCat 함수를 사용하기
function AnotherComponent() {

  const fetchData = async () => {
    sendLogToLogCat('패치 함수 시작');
    try {
      // ... 데이터 fetching 로직
      sendConsoleToLogCat('info', '데이터 fetching 성공');
    } 
    catch (error) {
      sendConsoleToLogCat('error', `데이터 fetching 실패: ${error.message}`);      
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>Fetching Data...</div>
  );
}


**************************************************************************************************************************
// overrideConsoleFunctionsForLogCat 함수 사용 예시
****************************************************

// 해당 컴포넌트의 내부에 선언되는 콘솔은 모두 로그캣 콘솔로 출력됨
function MyComponent() {

  useEffect(() => {
    // 컴포넌트가 마운트될 때 console 함수를 재정의 (전역적으로 적용)
    overrideConsoleFunctionsForLogCat();
  }, []);

  const handleClick = () => {
    sendLogToLogCat('log', '버튼이 클릭되었습니다.');
    console.log('handleClick 이벤트 발생'); // 이 로그도 Logcat으로 전송됩니다 (overrideConsoleFunctionsForLogCat 호출 시)
    console.warn('주의: 처리되지 않은 상태입니다.'); // 이 경고도 Logcat으로 전송됩니다.
    console.error('에러 발생: API 응답 없음'); // 이 에러도 Logcat으로 전송됩니다.
  };

  return (
    <button onClick={handleClick}>Log to Logcat</button>
  );
}

***************************************************************************************************************************/


