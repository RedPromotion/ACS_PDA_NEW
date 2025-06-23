import React from 'react';
import { Dialog, DialogContent, DialogTitle, Button, Box, FormControl } from '@mui/material';
/**
 * @name CatDialogDecision 
 * - 선택 버튼 2개의 팝업창 생성 
 * 
 * @param {Object} props - 컴포넌트에 전달되는 props 객체.
 * @param {boolean} props.open - (필수) 팝업창의 열림 여부를 결정합니다.
 * @param {string} props.title - 팝업창의 제목입니다.
 * @param {string} props.text - 팝업창의 내용입니다.
 * @param {string} props.okText - 확인 버튼에 표시할 라벨입니다.
 * @param {Function} props.okEvent - 확인 버튼 클릭 시 실행되는 이벤트 함수입니다.
 * @param {string} props.noText - 취소 버튼에 표시할 라벨입니다.
 * @param {Function} props.noEvent - 취소 버튼 클릭 시 실행되는 이벤트 함수입니다.
 * @param {number} [props.timeout=0] - 팝업창이 사라지는 속도를 조절하는 시간(밀리초 단위)입니다.
 * @param {Object} [props.buttonStyle={ height: 70, fontSize: 24 }] - 확인 및 취소 버튼에 적용할 스타일 객체입니다.
 * 
 * @author sj_hong
 * @updated 2025-02-18T10:49:00Z
 * @example
 * <CatDialogDecision
 *   open={true}
 *   title="선택 창 샘플"
 *   text="버튼을 클릭"
 *   okText="확인"
 *   okEvent={() => { alert('확인됨') }}
 *   noText="취소"
 *   noEvent={() => { alert('취소됨') }}
 * />
 */
export default function CatDialogDecision({ open, title, text, okText, okEvent, noText, noEvent, timeout=0, buttonStyle = { height: 70, fontSize: 24 } }) {

    // 긍정 버튼 클릭 이벤트
    const handleOk = () => {
        if (okEvent) okEvent();
		// ...긍정 버튼 이벤트 추가
    };

    // 부정 버튼 클릭 이벤트
    const handleNo = () => {
        if (noEvent) noEvent();
		// ...부정 버튼 이벤트 추가
    };

    return (
        <Dialog
			open={open || false}
            fullWidth
            TransitionProps={{
				timeout: timeout, //사라지는속도조절
			}}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    {text || <></>}
                </FormControl>
                <Box display="grid" m={1} mt={5} gap={4}>
                    <Button
                        variant="contained"
						color="success"
                        fullWidth
                        sx={buttonStyle}
                        onClick={handleOk}
                    >
						{okText || <></>}
                    </Button>
                    <Button
                        variant="contained"
						color="error"
                        fullWidth
                        sx={buttonStyle}
                        onClick={handleNo}
                    >
						{noText ? noText : <></>}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
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

    const { setDecision, setOnLoading, setPopup, } = cat.useRootContext(); // cat파일에서 가져오기

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
        noEvent: () => { alert('취소됨') }, 
    })


**************************************************************************************************************************/