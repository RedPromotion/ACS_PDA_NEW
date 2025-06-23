import { createContext, useState, useContext ,useRef} from "react";
import CatDialogNotice from '../components/notification/CatDialogNotice'
import CatDialogDecision from '../components/notification/CatDialogDecision'
import CatLoadingScreen from '../components/notification/CatLoadingScreen'
const RootContext = createContext();
/** 
 * @name useRootContext 
 * - 앱 전체 사용하는 알림 모아놓은 콘텍스트 (구성요소 참조)
 * @setOnLoading 로딩화면 설정
 * @setPopup 알림 팝업창 (간단사용)
 * @setNoticeDialog 팝업창 직접 매개변수 할당하여 사용하기
 * @setDecision 이중 택일 선택 팝업창 생성
 * @setAlertSnackBar 작은알림창 직접 매개변수 할당하여 사용하기
 */
export function useRootContext() {
    return useContext(RootContext);
}

/**
 * @name RootProvider
 * @description 
 * - 전체 페이지에서 사용할 알림 기능 모아놓은 콘텍스트
 * - 팝업, 스낵바, 로딩화면, 선택창 등을 설정하는 함수를 모아놓은 페이지
*/
export function RootProvider ({ children }) {

    const [isTopBarVisible, setIsTopBarVisible] = useState(true);//탑바 사용여부 플래그
    const [isSideMenuBarVisible, setIsSideMenuBarVisible] = useState(false);//사이드메뉴바 사용 플래그  
    const [onloading, setOnLoading] = useState(false); //로딩효과 플래그
    const [isUseManualInputContext, setIsUseManualInputContext] = useState(false);//수동 바코드 입력 플래그    

    const [noticeDialog, setNoticeDialog] = useState({ 	//알림 팝업창 값 설정   
        open: false,
        title: '알림',        
        text: "",
        label: '확인',        
        timeout: 0,
        colorCondition: 'primary',
        buttonStyle: { height: 50, fontSize: 24 }
    });
    

    const [decisionDialog, setDecisionDialog] = useState({ //결정 팝업창 값 설정
        open: false,
        title: "",
        text: "",
        okText: "",
        okEvent: () => { },
        noText: "",
        noEvent: () => { },
    });

    /**      
     * @name setPopup
     * @param {...string} param - 팝업창에 표시할 메시지들.
     *   @example
     *   // 내용만 설정:
     *   setPopup("저장되었습니다.");
     *   @example
     *   // 제목과 내용을 설정:
     *   setPopup("경고", "저장에 실패하였습니다.");
     *  @example
     *   // 제목과 내용, 버튼명칭을 설정:
     *   setPopup("경과", "아래의 내용이 진행됩니다.", "결정");
     * @description
     * - 인자가 1개 전달되면: 해당 문자열을 팝업창 내용(text)으로 설정.
     * - 인자가 2개 전달되면: 첫번째 문자열은 제목(title), 두번째 문자열은 내용(text)으로 설정.
     * - 인자가 3개 전달되면: 첫번째 문자열은 제목(title), 두번째 문자열은 내용(text)으로 세번째 문자열은 버튼라벨(label)로 설정.
     */
    const setPopup = ( ...param ) => {   
        
        //진동가능여부 확인, 진동가능하면 진동하고, 아닐 경우 콘솔에 경고
        /*
        if ("vibrate" in navigator) {
            navigator.vibrate(800); // 1000 -> 1초 , 800 -> 0.8초
        }
        else {            
            console.warn("현재 진동 기능을 지원하지 않습니다.");
        }
        */

        //PDA 네이티브 진동 기능 호출
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIBRATION' }));
        }
    
        // 매개변수가 1개: 내용만 나타내는 팝업, 매개변수 1개 문자열, 텍스트 변경만 제공하는 팝업알림
        if (param.length === 1 && typeof param[0] === 'string' && param[0] !== '' ) {
            setNoticeDialog({
                ...noticeDialog,
                open: true, 
                text: param[0]
            });
        }

        // 매개변수가 2개: 제목과 텍스트 둘다 나타내는 팝업, 매개변수 2개 문자열을 제목과 텍스트로 2개의 매개변수 활용
        else if (param.length === 2 && typeof param[0] === 'string' && typeof param[1] === 'string' && param[0] !== '' && param[1] !== '' ) {
            setNoticeDialog({
                ...noticeDialog,
                open: true, 
                title: param[0],
                text: param[1],
            });
        }
         // 매개변수가 3개: 제목, 텍스트, 버튼 라벨 할당
        else if (
            param.length === 3 &&
            typeof param[0] === 'string' &&
            typeof param[1] === 'string' &&
            typeof param[2] === 'string' &&
            param[0] !== '' &&
            param[1] !== '' &&
            param[2] !== ''
        ) {
            setNoticeDialog({
                ...noticeDialog,
                open: true,
                title: param[0],
                text: param[1],
                label: param[2],                
            });
        }
        //예외처리 
        else {
            console.warn(`setPopup 매개변수 할당 에러 ${param}`);
            setNoticeDialog({
                ...noticeDialog,
                open: true, 
                title: '에러 팝업',
                text: `${param}`,
                label: '확인',
            });
        }
    };  

    /** 
     * @name setDecision
     * @param {Object} options - 팝업창 옵션 객체.
     * @param {boolean} [options.open=false] - 팝업창이 열릴지 여부.
     * @param {string} [options.title=""] - 팝업창 제목.
     * @param {string} [options.text=""] - 팝업창 내용.
     * @param {string} [options.okText=""] - 확인 버튼에 표시할 텍스트.
     * @param {Function} [options.okEvent=() => {}] - 확인 버튼 클릭 시 실행되는 이벤트 함수.
     * @param {string} [options.noText=""] - 취소 버튼에 표시할 텍스트.
     * @param {Function} [options.noEvent=() => {}] - 취소 버튼 클릭 시 실행되는 이벤트 함수.
     * 
     * @example     
     * setDecision({
     *      open: true, 
     *      title: "선택 창 샘플",
     *      text: "버튼을 클릭", 
     *      okText: "확인", 
     *      okEvent: () => { alert('확인됨') }, 
     *      noText: "취소", 
     *      noEvent: () => { alert('취소됨') }, 
     *  })
     *
     */
    const setDecision = ({ open= false, title= "", text= "", okText= "", okEvent= () => { }, noText= "", noEvent= () => { }, })=> {  
        
        /** 할당된 OK이벤트 실행 후 닫기 */
        const AddCloseOk =()=> {            
            if (typeof okEvent === 'function') { // 함수일 경우 실행
                okEvent();
            }   
            else { // 성공인데 함수 아니면 에러 발생
                console.error(` ${okEvent} 확인 버튼의 이벤트 할당이 잘 못 되었습니다. 이벤트 동작 실패` )
            }
            setDecisionDialog({
                open: false,
                title: "",
                text: "",
                okText: "",
                okEvent: () => { },
                noText: "",
                noEvent: () => { },
            })
        }

        /** 할당된 NO이벤트 실행 후 닫기 */
        const AddCloseNo=()=> {
            if (typeof noEvent === 'function') { // 함수일 경우 실행
                noEvent();
            }   
            setDecisionDialog({
                open: false,
                title: "",
                text: "",
                okText: "",
                okEvent: () => { },
                noText: "",
                noEvent: () => { },
            })
        }
        
        /** 매개변수로 선택팝업창 생성 */
        setDecisionDialog({
            open: open,
            title: title,
            text: text,
            okText: okText,
            okEvent: AddCloseOk,
            noText: noText,
            noEvent: AddCloseNo,
        })
    };

    return (
        <RootContext.Provider
            value={{
                //동작
                setOnLoading, //로딩화면 설정
                setPopup,  //알림 팝업창 (간단사용하기)
                setNoticeDialog, //팝업창 직접 사용하기
                setDecision, //이중 택일 선택창
                //전역변수
                isTopBarVisible, setIsTopBarVisible,
                isSideMenuBarVisible, setIsSideMenuBarVisible,
                isUseManualInputContext, setIsUseManualInputContext,                
            }}>
            <CatDialogNotice
                title={noticeDialog.title}
                open={noticeDialog.open}
                text={noticeDialog.text}
                label={noticeDialog.label}
                event={() => {  // 확인버튼 이벤트 
                    setNoticeDialog({open: false}); // 내부 값 초기화
                    if(onloading === true){ // 로딩이 켜져있을 경우 로딩 종료함
                        setOnLoading(false);
                    }                 
                }}
                timeout={noticeDialog.timeout}
                colorCondition={noticeDialog.colorCondition}
                buttonStyle={noticeDialog.buttonStyle}
            />
            <CatDialogDecision
                open={decisionDialog.open}
                title={decisionDialog.title}
                text={decisionDialog.text}
                okText={decisionDialog.okText}
                okEvent={decisionDialog.okEvent}
                noText={decisionDialog.noText}
                noEvent={decisionDialog.noEvent}
            />
             <CatLoadingScreen 
                open={onloading}
            />
            {children}
        </RootContext.Provider>
    )
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
**************************************************************************************************************************
cat에서 임포트해서 사용하기 예시
***********************************

    import * as cat from "../../utils/cat" // 페이지에 도입

    const { setPopup, setNoticeDialog, setDecision, setOnLoading, setAlertSnackBar } = cat.useRootContext(); // cat파일에서 가져오기


**************************************************************************************************************************
팝업창 사용하기
***************

    setPopup('팝업의 내용이 들어갑니다.');

    setPopup('팝업제목', '팝업의 내용이 들어갑니다.');


**************************************************************************************************************************
선택창 사용하기
****************

    // 함수 호출 방식 예시
    const excuteOK = ()=> { 
        alert('확인됨')
    }
    
    setDecision({
        open: true, 
        title: "선택 창 샘플",
        text: "버튼을 클릭", 
        okText: "확인", 
        okEvent: excuteOK, 
        noText: "취소", 
        noEvent: () => { alert('취소됨') }, // 내부 사용 예시
    })

**************************************************************************************************************************
로딩스크린 켜기
***************

    const [isLoading, setIsLoading] = useState(false)

    setOnLoading(true);

**************************************************************************************************************************/