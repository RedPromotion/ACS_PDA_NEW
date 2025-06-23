//env파일의 주소 값 받기 (빌드 시 고정 주소 값)
const ENV_API_GENERAL = import.meta.env.VITE_PDA_API_GENERAL_URL;
const ENV_API_OUTPUT = import.meta.env.VITE_PDA_API_OUTPUT_PARAMETER_URL;
const ENV_API_OUTPUT_FRONT = import.meta.env.VITE_PDA_API_OUTPUT_PARAMETER_FRONT_URL;
/**
 * @name useFetch
 * @param {string} procedure (필수) 호출할 프로시저 이름
 * @param {Array<string | number | Array<any> | null>} parameter (필수) 프로시저 매개변수
 *  - 각 매개변수는 문자열, 숫자, 배열, null 값 중 하나일 수 있습니다.
 *  - 매개변수의 순서는 프로시저에 정의된 순서와 일치해야 합니다.
 * @param {"GENERAL" | "OUTPUT" | "OUTPUT_FRONT" } [api="GENERAL"] (선택) 호출할 API 종류
 *  - "GENERAL": 일반적인 API 호출 (기본값)
 *  - "OUTPUT": OUTPUT 파라미터가 있는 프로시저 호출
 *  - "OUTPUT_FRONT": OUTPUT 파라미터를 프론트엔드로 전달하는 프로시저 호출
 *  - "GETDATE": 현재 날짜를 반환하는 API 호출
 * @param {string} [userPlant] (선택) 공장 명칭 (제공되지 않을 경우 로컬 스토리지에서 찾습니다.)
 * @param {string} [identifier] (선택) 에러시 표기될 문자열 입력
 * @param {string} [eventType] (선택) 이벤트 종류
 * @param {string} [eventName] (선택) 이벤트 이름
 * @param {string} [userID] (선택) 사용자 ID
 * @param {boolean} [isUsePublicConfig=false] (선택) (기본값 false) true일 경우 public의 config의 api 주소를 기본 주소로 삼고, false이면 env파일에서 참조 
 * @author sj_hong 
 * @updated 2025-05-26
 * @version 1.3.3
 * @description 서버에 프로시저를 호출하고 결과를 반환하는 함수
 * @example
 * // 프로시저 호출 예시
 * (async () => {
 *	const fetchResult = await useFetch({
 *		procedure: '프로시저명',
 *		parameter: ['매개변수1', '매개변수2'],
 * 	 });
 * 	 console.log(fetchResult); // 결과 확인
 * })();
 */
 export default async function useFetch ({ 
	procedure, 
	parameter, 
	api = "GENERAL",
	userID = localStorage.getItem('userEmp') ,
	userPlant = "MOBISGJ_IP",//localStorage.getItem('userPlant')로 대체 예정
	eventType = '',
	eventName = '',	
	isUsePublicConfig = false,
}) 
{   	
	try {	
		
		/****************************************
		* 필수 매개변수 프로시저 지정 에러 예외처리
		*****************************************/
		if(procedure === null ){
			throw new Error(`procedure [${procedure}] get null`);			
		}
		if(procedure === undefined){
			throw new Error(`procedure [${procedure}] get undefined`);			
		}
		if(procedure.trim() === ''){
			throw new Error(`procedure [${procedure}] get empty`);			
		}



		/****************************************
		* 매개변수 자료형 분기 별 처리
		*****************************************/
		else if (Array.isArray(parameter)) {//배열분기
			parameter = [...parameter].map(el => `'${el}'`).join("&del;") //구분자 추가
		} 		
		else if (parameter === undefined) {//에러분기
			throw new Error(`처리 될 수 없는 매개변수 undefined [${parameter}] (권장 매개변수 : 배열, 문자열)`);
		}
		else if (parameter === null) {//에러분기
			throw new Error(`처리 될 수 없는 매개변수 null [${parameter}] (권장 매개변수 : 배열, 문자열)`);
		}
		else {//예외분기
			throw new Error(`지정되지 않은 매개변수 형태 [${parameter}] (권장 매개변수 : 배열, 문자열)`);
		}

		/****************************************
		* api 연결 분기 처리
		*****************************************/
		api = api.toUpperCase()
		if(!api){ // null, empty, 공백 등 예외처리
			throw new Error(`API미설정. ['${procedure}']`)			
		}
		else if (api === 'GENERAL' && isUsePublicConfig === true) {
			api = window.PDA_API.GENRAL_URL;//public의 config.js에 적힌 주소 값 받기 (빌드 무관 동적 주소 값)
		} 
		else if (api === 'OUTPUT' && isUsePublicConfig === true) {
			api = window.PDA_API.OUTPUT_PARAMETER_URL;//public의 config.js에 적힌 주소 값 받기 (빌드 무관 동적 주소 값)
		} 
		else if (api === 'OUTPUT_FRONT' && isUsePublicConfig === true) {
			api = window.PDA_API.OUTPUTP_PARAMETER_FRONT_URL;//public의 config.js에 적힌 주소 값 받기 (빌드 무관 동적 주소 값)
		}
		else if (api === 'GENERAL' && isUsePublicConfig === false) {
			api = ENV_API_GENERAL;
		} 
		else if (api === 'OUTPUT' && isUsePublicConfig === false) {
			api = ENV_API_OUTPUT;
		} 
		else if (api === 'OUTPUT_FRONT' && isUsePublicConfig === false) {
			api = ENV_API_OUTPUT_FRONT;
		}
		else{ //지정되지 않은 함수 사용        
			throw new Error(`Api Unknown API '${ api }' detected. [in Procedure : '${procedure}']`)			
		}


		/****************************************
		* API 호출 및 처리 (핵심)
		*****************************************/	
		const response = await fetch(api, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userID: userID
				,userPlant: userPlant 
				,serviceID: procedure
				,serviceParam: parameter 
				,serviceCallerEventType: eventType
				,serviceCallerEventName: eventName
				,clientNetworkType: navigator.connection && navigator.connection.effectiveType 
					? navigator.connection.effectiveType 
					: 'unknown'
			}),
		});


		
		/****************************************
		* 결과 검사 
		*****************************************/
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}	
		const data = await response.json(); 
		if (data.returnErrorMsg !== null) // undefined 또는 null 체크
		{
			throw new Error(`ErrorMsg : ${data.returnErrorMsg} [${procedure}]`);					
		} 
		else if (data.returnUserMessage !== null ) //에러 (유저메시지를 에러로 취급 시)
		{
			throw new Error(`UserMessage : ${data.returnUserMessage} [${procedure}]`);
		}


		/************************************************
		* 반환 값 검사 후 있다면, 파싱하여 데이터 출력 시도
		*************************************************/		
		const rtnValue = data["returnValue"].map(row => {
				
			// JSON 문자열을 객체로 파싱
			const parsedRow = JSON.parse(row);
			
			// (예외처리) 조건1. 행이 1개면서
			if (parsedRow.length === 1) {
				const firstObject = parsedRow[0];
				
				// 조건2. 모든 컬럼의 값이 공백일때, (스페이스바는 값이 있다고 간주하여 해당없음)
				const allValuesEmpty = Object.values(firstObject).every(value => {
					return String(value).trim() === '';
				});
			
				// 조건1과2 만족 시 해당 row를 빈 배열로 판단함
				if (allValuesEmpty) {
					return [];
				}
			}

			// 정상 값으로 판명되면 그대로 반환
			return parsedRow;
		});

		//최종출력		
		return rtnValue			
	} 
	catch (error) { 
		console.error(`
			${'[API]'} [CATCH ERROR] [${procedure}] : ${error} ]			
		`);
		throw error // 상위 페이지에 에러 전달
	}	
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
**************************************************************************************************************************/
/******************************************************************************************
사용예시1. 변수로 저장하여 사용하기
-------------------------------------------------------------------------------------------

	//fetch 프로시저 변수에 저장
	const getData = async () => {
		try {
			const result = await useFetch({
                api: "GENERAL"
				procedure:"프로시저",
				parameter:["매개변수1"], 
				eventType:"이벤트타입",
				eventName:"이벤트이름",
			});
			console.log("성공: ", result); // RESULT에 값 저장됨
		} catch (err) {
			console.error("에러: ", err);
		} 
	};


	getData(); //함수 동작

*******************************************************************************************/
/******************************************************************************************
사용예시2. 연속적으로 프로시저 사용하기
		> 주의사항 : 중간에 set함수를 활용하여 반영할시 try ~ Catch 중 에러로 잡혀도 롤백 안됨
-------------------------------------------------------------------------------------------

	//fetch 프로시저 변수에 저장
	const getData = async () => {
		try {
			const result1 = await useFetch({ // 첫번째 동작 프로시저
                api: "GENERAL"
				procedure:"프로시저1",
				parameter:["매개변수1"], 
				eventType:"이벤트타입",
				eventName:"이벤트이름",
			});			
			const result2 = await useFetch({ // 두번째 동작 프로시저
                api: "GENERAL"
				procedure:"프로시저2",
				parameter:["매개변수2"], 
				eventType:"이벤트타입",
				eventName:"이벤트이름",
			});
			console.log("성공: ", result1 , result2); // 각각의 result 값에 저장됨.
		} catch (err) {
			console.error("에러: ", err);
		} 
	};


	getData(); //함수 동작

*******************************************************************************************/
/******************************************************************************************
사용예시3. 여러개의 매개변수 사용하기 
-------------------------------------------------------------------------------------------

	//fetch 조회하고 result에 값 저장한 뒤 사용하기 
	(async () => { //비동기처리
		try {
			//useFetch사용
			const result = await useFetch({ //result에 값 저장
                api: "GENERAL",
				procedure:"프로시저",  //프로시저 입력
				parameter:["매개변수1", "매개변수2", "매개변수3"],  //매개변수 부여
				eventType:"", 
				eventName:"",
			});
			console.log(result); // RESULT에 값 저장됨
		} 
		catch (err) { // 예외 처리
			console.log(err); 
		} 
		finally {
			console.log("finaly"); 
		}
	})();


*******************************************************************************************/
/******************************************************************************************
사용예시4. 매개변수 미사용 프로시저에 null로 전달하기
-------------------------------------------------------------------------------------------

	//fetch 조회하고 result에 값 저장한 뒤 사용하기 
	(async () => { //비동기처리
		try {
			//useFetch사용
			const result = await useFetch({ //result에 값 저장
                api: "GENERAL",
				procedure:"프로시저",  //프로시저 입력
				parameter:null,  //매개변수 미사용으로 null로 부여 
				eventType:"", 
				eventName:"",
			});
			console.log(result);			
		} 
		catch (err) { // 예외 처리
			console.log(err); 
		} 
		finally {
			console.log("finaly"); 
		}
	})();


*******************************************************************************************/