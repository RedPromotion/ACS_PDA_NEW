const ENV_API_DICTIONARY = import.meta.env.VITE_PDA_API_DICTIONARY_URL;//env파일의 주소 값 받기 (빌드 시 고정 주소 값)
/***************************************** 
 * @name getTranslationFromDataBase
 * @param {Object} param0 
 * @param {*} [param0.isUsePublicConfig="true"] api 사용처 (기본 public폴더 config.js 동적api 할당)
 * @param {string} [param0.procedure="USP_PDA_DICTIONARY"] 
 * @param {string | null} [param0.userPlant=localStorage.getItem('userPlant')] 
 * @param {string} [param0.language] 언어 유형 할당
 * @param {*} param0.i18nInstance 사용하는 페이지에서 i18n 할당해야함!
 * @description 
 * - 번역 자료를 데이터베이스에서 가져옴 
 * - 연동 테이블 명은 필수 `TB_DICTIONARY` 
 * - 연동 프로시저 명은 필수 `USP_PDA_DICTIONARY` 
 * - 연동 로컬스토리지명은 권장 `LANGUAGE` 
 *****************************************/
export default async function getTranslationFromDataBase({
    isUsePublicConfig = true,	
    procedure = "USP_PDA_DICTIONARY",
    userPlant = localStorage.getItem('userPlant'),
    language = localStorage.getItem('LANGUAGE'),
    i18nInstance // 사용하는 페이지에서 값 할당해야함 !
  }) {
    if (localStorage.getItem('PDA_LANG') && localStorage.getItem('PDA_LANG') === 'K') {
      return;
    }
  
    let api;
    if (!isUsePublicConfig) {
      api = window.PDA_API_INFOMATION.DICTIONARY_URL;
    } 
    else if (isUsePublicConfig === true) {
      api = window.PDA_API_INFOMATION.DICTIONARY_URL;
    }
    else if (isUsePublicConfig === false) {
      api = ENV_API_DICTIONARY;
    }
    else{
      console.error(`[ACS] function getTranslationFromDataBase get API value error : ${isUsePublicConfig}`);
    }
  
    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPlant,
          serviceID: procedure,
          serviceParam: language,
          serviceCallerEventType: 'Translation',
          serviceCallerEventName: 'Translation',
          clientNetworkType:
            navigator.connection && navigator.connection.effectiveType
              ? navigator.connection.effectiveType
              : 'unknown',
        }),
      });
  
        //응답메시지 검사
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }  

        //데이터 존재여부검사
        const data = await response.json();        
        if(!data.returnValue){
          console.warn('[ACS] function getTranslationFromDataBase not return value');          
          return
        }        
        
        //키값 쌍 형태로 저장하기 위해 변경
        const result = JSON.parse(data.returnValue[0]).reduce((acc, item) => {
            const key = Object.keys(item)[0];
            const value = item[key];
            if (key && value) {
              acc[key.trim()] = value.trim();
            }
            return acc;
        }, {});                
      
        // i18n 인스턴스를 통해 번들 적용
        i18nInstance.removeResourceBundle(language, 'translation');
        i18nInstance.addResourceBundle(language, 'translation', result);
        i18nInstance.changeLanguage(language);
        
        return result;
    } 
    catch (err) {
      console.error(err);
      throw err;
    }
}
/***************************************** 
 * 다봄 > 언어번역 > 프로시저 & 테이블 목록
****************************************
- USP_PDA_DICTIONARY 
- [pk_ATM_code_sp_dictionary_L]
    - TB_DICTIONARY 
- [pk_ATM_code_sp_dictionary_S]
    - fn_getErrMsg 
    - fn_getValues 
    - TB_DICTIONARY 
    - TB_LANGUAGE 
- [pk_ATM_code_sp_dictionary_D]
    - fn_getErrMsg 
    - TB_DICTIONARY 
*****************************************/