const API_GENERAL 		= import.meta.env.VITE_PDA_API_GENERAL_URL;
const API_OUTPUT 		= import.meta.env.VITE_PDA_API_OUTPUT_PARAMETER_URL;
const API_OUTPUT_FRONT 	= import.meta.env.VITE_PDA_API_OUTPUT_PARAMETER_FRONT_URL;
const API_GETDATE 		= import.meta.env.VITE_PDA_API_GETDATE_URL;
/*******************************************************************************************
@verison   
VER         DATE        AUTHOR              DESCRIPTION
----------  ----------	---------------	    ------------------------------- 
0.01        2024-09-27  sj_hong             1.신규생성
0.02		2024-10-10	sj_hong				1.개발참조용 consoleMode 매개변수 추가
											2.결과값 반환 여부 자체를 확인하여 조치하는 매개변수 추가
0.03		2024-10-18	sj_hong				1.매개변수 null 처리, PARSE 처리 확인 추가
0.04		2024-10-21	sj_hong				1.2개 이상의 select 처리 분기 매개변수 및 코드 추가
0.05		2024-10-22	sj_hong				1.프로시저 미지정 경고 추가
0.06		2024-10-22	sj_hong				1.파싱안하고 그냥 날 데이터 가져오는 분기 추가
0.07		2024-12-08	sj_hong				이중 배열로 호출 시, 조회 조건 없는 분기의 예외처리 추가
0.08		2024-12-19	sj_hong				단일 배열로 조회 시, 조회 조건 없는 분기의 예외처리 추가 
*******************************************************************************************/
/*******************************************************************************************	 
@Page UseFetchParam.jsx
@Function ACS API 호출, 운영서버 연결
@param  {string} procedure 				(필수) 프로시저 명 
@param  {array} parameter 				(필수) 프로시저 매개변수 ( 단일문자열, 단일숫자, 배열, null )
@param  {string} api 					(선택) 호출할 api 종류 선택 기본설정은 GENERAL [GENERAL, OUTPUT, OUTPUT_FRONT, GETDATE]
@param  {string} EventType 				(선택) EventType 값 부여
@param  {string} EventName 				(선택) EventName 값 부여
@param  {boolean} isSelectMultiple 		(선택) 조회 결과가 여러개 일 경우 배열로 반환 처리 따로 함
@param  {boolean} UserMessageIsError 	(선택) (기본값 true, 유저메시지를 에러로 취급함)
@param  {boolean} isVoidProcedure 		(선택) SELECT가 없는 프로시저로 설정하여 결과를 Parse 하지 않아 정상과정으로 취급 (기본 값 false)
@param  {boolean} consoleMode 			(선택) true로 설정 시, 콘솔에 과정값 과 결과값 알림 뜸 (기본 값 false)
@description 운영서버 연결 API 
*******************************************************************************************/
export default async function UseFetchParam ({ 
	// 필수 매개변수
	procedure, 
	parameter, 
	// 옵션 매개변수
	EventType = '', 
	EventName = '', 	
	api = "GENERAL", 	
	isSelectMultiple = false,
	UserMessageIsError = true,
	isVoidProcedure = false,
	isConsoleMode = false,	
}) 
{
   	//필수 매개변수 프로시저 지정 에러 예외처리
	if(procedure === null ){
		throw new Error(`procedure [${procedure}] get null`);
	}
	if(procedure === undefined){
		throw new Error(`procedure [${procedure}] get undefined`);
	}
	if(procedure.trim() === ''){
		throw new Error(`procedure [${procedure}] get empty`);
	}

	//매개변수 자료형 분기 별 처리 
	if (Array.isArray(parameter)) {//배열 분기
		parameter = [...parameter].map(el => `'${el}'`).join("&del;") //구분자 추가		
	} 
	else if (typeof parameter === 'string' || typeof parameter === 'number' || parameter === null) { // 배열 외 가능한 자료형 분기
		//	수용 가능한 매개변수 검사 분기
			// 		string 은 문자를 그대로 사용
			// 		number 은 숫자를 그대로 사용
			// 		null 은 매개변수 안 받는 프로시저에서 적용
	}
	else if (parameter === undefined) {//에러 분기
		throw new Error(`처리 될 수 없는 매개변수 undefined ${parameter}, [권장 매개변수 : 배열, 문자열, null]`);
	}
	else {
		throw new Error(`지정되지 않은 매개변수 형태 ${parameter}`);
	}

	//콘솔확인 시, 매개변수 보여주는 부분
	if(isConsoleMode){
		console.log(`ConsoleMode [${procedure}] parameter : ${parameter} `)
	}
 
    //api 연결 분기 처리
	if(!api){ // null, empty, 공백 등 예외처리 
        console.error(`Api parameter is Empty detected. [in Procedure : '${procedure}']`);
		throw new Error(`Api parameter is Empty detected. [in Procedure : '${procedure}']`)
    }
    else if(api.toUpperCase() === 'GENERAL'){
        api = API_GENERAL;
    }
    else if(api.toUpperCase() === 'OUTPUT'){
        api = API_OUTPUT;
    }
    else if(api.toUpperCase() === 'OUTPUT_FRONT'){
        api = API_OUTPUT_FRONT;
    }
    else if(api.toUpperCase() === 'GETDATE'){
        api = API_GETDATE;
    }
    else{ //지정되지 않은 함수 사용
        console.error(`Unknown API name '${ api.toUpperCase() }' detected. [Procedure: ${procedure}] `);
		throw new Error(`Api parameter is Error detected. [in Procedure : '${procedure}']`)
    }

    // 개발자용 : 값 확인 필요시 ture로 조건을 주어서 console로 확인가능 
    if(isConsoleMode){       
		console.log(`UseFetchParam log [${procedure}] Input Parameter : ${parameter}`);
		throw new Error(`Api parameter is Error detected. [in Procedure : '${procedure}']`)
    }

	//API 호출 및 처리
    try {					
		const response = await fetch(api, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userID: localStorage.getItem('userEmp') // userId 변수로 대체 가능
				,userPlant: "MOBISGJ_IP" // localStorage.getItem('userPlant') //공장 정보 기준 (DB구분 플래그 값 appsetting.json 의 DBINFO)
				,serviceID: procedure
				,serviceParam: parameter // [...parameter].map(el => `'${el}'`).join("&del;"), //이전 구분자 추가 방식
				,serviceCallerEventType: EventType
				,serviceCallerEventName: EventName
				,clientNetworkType: navigator.connection.effectiveType
			}),
		});
		const data = await response.json(); 

		// ----- 결과 처리 -----
		
		if (data.returnErrorMsg !== null) //에러
		{
			console.error(`API ERROR return returnErrorMsg : ${data.returnErrorMsg} [Procedure: ${procedure}]`);
			throw new Error(data.returnErrorMsg);
		} 
		else if (data.returnUserMessage !== null && UserMessageIsError === true ) //에러 (유저메시지를 에러로 취급 시)
		{
			console.error(`API ERROR return UserMessage : ${data.returnUserMessage} [Procedure: ${procedure}]`);
			throw new Error(data.returnUserMessage);
		} 
		else if (data.returnUserMessage !== null && UserMessageIsError === false ) //출력 (유저메시지를 값으로 취급 시)
		{
			if(isConsoleMode){
				console.log(`ConsoleMode [${procedure}] returnUserMessage : ${data.returnUserMessage} `)
			}
			return data.returnUserMessage
		} 
		else //데이터베이스 연결 성공 이후 처리
		{					
			if(isVoidProcedure === true){ //조회 없는 액션 프로시저 처리 (매개변수에 명시)
				return
			}
			//데이터 출력 시도 (파싱)
			try {
				if(isSelectMultiple === false) // 조회 select 가 1개 일 경우
				{
					const rtnValue = JSON.parse(data["returnValue"][0])

					// 조건1. 행이 1개면서
					if (rtnValue.length === 1) {
						const firstObject = rtnValue[0];

						// 조건2. 모든 컬럼의 값이 공백일때, (스페이스바는 값이 있다고 간주하여 해당없음)
						const allValuesEmpty = Object.values(firstObject).every(value => {
							// 공백, null, undefined 체크
							return String(value) === '';
						});

						// 조건1과2 만족 시 해당 row를 빈 배열로 변경
						if (allValuesEmpty) {
							return [];
						}
					}

					if(isConsoleMode){
						console.log(`ConsoleMode [${procedure}] Select Single return Value : `)
						console.log(  JSON.parse(data["returnValue"][0])  )
					}	

					//값 출력
					return rtnValue; 
				}
				if(isSelectMultiple === true) // 조회 select 가 2개 이상 일 경우
				{
					const rtnValue = data["returnValue"].map(row => {
						
						// JSON 문자열을 객체로 파싱
						const parsedRow = JSON.parse(row);
					  
						// (필터링) api 가 공백값 출력 시 예외처리
						/***************************
						@History
						DB에서 조회 시, 조회 결과가 없는 경우,
						API에서 각 컬럼값에 공백값을 부여하여 1개행으로 출력함.
						아래 예외조건에서 없는 배열로 만들고 반환함
						***************************/
						
						// 조건1. 행이 1개면서
						if (parsedRow.length === 1) {
						  const firstObject = parsedRow[0];
							
						  // 조건2. 모든 컬럼의 값이 공백일때, (스페이스바는 값이 있다고 간주하여 해당없음)
						  const allValuesEmpty = Object.values(firstObject).every(value => {
							return String(value) === '';
						  });
					  
						  // 조건1과2 만족 시 해당 row를 빈 배열로 변경
						  if (allValuesEmpty) {
							return [];
						  }
						}

						if( isConsoleMode ){
							console.log(`ConsoleMode [${procedure}] Select Multiple return Value : ${parsedRow} `)
						}
					  
						// 정상 값으로 판명되면 그대로 반환
						return parsedRow;
					});

					if( isConsoleMode ){
						console.log(`ConsoleMode [${procedure}] Select Multiple return Value : ${rtnValue} `)
					}
						
					return rtnValue; // 페이지에 이중배열로 저장됨 
				}							
			} 
			catch (err) { //파싱 실패 시, 조회 없는 액션 프로시저로 간주하여 경고 및 return 후 종료
				if(isConsoleMode)
				{
					console.log(`ConsoleMode [${procedure}] return Value : parse fail`)
				}
				console.warn(`[${procedure}] is return parse Fail, void value return, ${err}`);
				return
			}
		}
	} 
	catch (err) //에러
	{
		console.error(`API ERROR return catch : ${err} [Procedure: ${procedure}]`);
		throw new Error(err);
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
			const result = await UseFetchParam({
                api: "GENERAL"
				procedure:"프로시저",
				parameter:["매개변수1"], 
				EventType:"이벤트타입",
				EventName:"이벤트이름",
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
			const result1 = await UseFetchParam({ // 첫번째 동작 프로시저
                api: "GENERAL"
				procedure:"프로시저1",
				parameter:["매개변수1"], 
				EventType:"이벤트타입",
				EventName:"이벤트이름",
			});			
			const result2 = await UseFetchParam({ // 두번째 동작 프로시저
                api: "GENERAL"
				procedure:"프로시저2",
				parameter:["매개변수2"], 
				EventType:"이벤트타입",
				EventName:"이벤트이름",
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
			const result = await UseFetchParam({ //result에 값 저장
                api: "GENERAL",
				procedure:"프로시저",  //프로시저 입력
				parameter:["매개변수1", "매개변수2", "매개변수3"],  //매개변수 부여
				EventType:"", 
				EventName:"",
			});
			console.log(result); // RESULT에 값 저장됨
		} catch (err) { // 예외 처리
			console.log(err); 
		} finally {
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
			const result = await UseFetchParam({ //result에 값 저장
                api: "GENERAL",
				procedure:"프로시저",  //프로시저 입력
				parameter:null,  //매개변수 미사용으로 null로 부여 
				EventType:"", 
				EventName:"",
			});
			console.log(result);			
		} catch (err) { // 예외 처리
			console.log(err); 
		} finally {
			console.log("finaly"); 
		}
	})();


*******************************************************************************************/



/******************************************************************************************
사용예시5.   isSelectMultiple = true 로 설정하여 여러개의 select 프로시저 처리하기
-------------------------------------------------------------------------------------------

	//fetch 조회하고 result에 값 저장한 뒤 사용하기 
	(async () => { //비동기처리
		try {
			//useFetch사용
			const result = await UseFetchParam({ //result에 값 저장
                api: "GENERAL",
				procedure:"프로시저",  //프로시저 입력
				parameter:["매개변수1", "매개변수2", "매개변수3"],  //매개변수 부여
				EventType:"", 
				EventName:"",
				isSelectMultiple: true,		
			});

			// 페이지에서 이중배열로 저장됨
			console.log(result);

			console.log(result[0][0]);
			console.log(result[1][0]);
									
			
		} catch (err) { // 예외 처리
			console.log(err); 
		} finally {
			console.log("finaly"); 
		}
	})();


*******************************************************************************************/