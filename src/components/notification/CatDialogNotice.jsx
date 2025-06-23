import React from 'react';
import { Dialog, DialogContent, DialogTitle, Button, Box, FormControl } from '@mui/material';
/**
 * @name CatDialogNotice 
 * - 확인 버튼만 있는 알림용 팝업창을 생성
 * 
 * @param {Object} props - 컴포넌트의 속성
 * @param {boolean} props.open - (필수) 팝업창의 열림 여부
 * @param {string} [props.title="알림"] - 팝업창의 제목
 * @param {string} [props.text] - 팝업창의 내용
 * @param {string} [props.label="확인"] - 확인 버튼 텍스트
 * @param {Function} [props.event] - 확인 버튼 클릭 시 실행할 함수
 * @param {number} [props.timeout=0] - 팝업창이 사라지는 속도 (ms 단위)
 * @param {"primary" | "success" | "error" | "inherit"} [props.colorCondition="primary"] - 버튼 색상 조건
 * @param {Object} [props.buttonStyle={height: 50, fontSize: 24}] - 버튼 스타일 (MUI sx 속성 사용 가능)
 *
 * @author sj_hong
 * @updated 2025-02-18T10:49:00Z
 * @example
 * <CatDialogNotice 
 *   open={true} 
 *   title="안내"
 *   text="작업이 완료되었습니다."
 *   label="확인"
 *   event={() => console.log("확인 버튼 클릭됨")} 
 *   colorCondition="success"
 * />
 */
export default function CatDialogNotice ({
	open,
	title = '알림',
	text,
	label = '확인',
	event,
	timeout = 0,
	colorCondition = 'primary',
	buttonStyle = { height: 50, fontSize: 24 }
}) {
	// 버튼 클릭 이벤트
	const handleEvent = () => {
		if (event) event();
		// ...이벤트 추가 가능
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
						fullWidth
						sx={buttonStyle}
						onClick={handleEvent}
						color={colorCondition}
					>
						{label || <></>}
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


**************************************************************************************************************************
팝업창 사용하기
***********************************

    setPopup('팝업의 내용이 들어갑니다.');

    setPopup('팝업제목', '팝업의 내용이 들어갑니다.');


**************************************************************************************************************************
상세입력 팝업창 직접 사용하기
***********************************

    setPopupDetail({
        title: '알림 제목',
        content: '알림 내용이 여기에 들어갑니다.',
        buttonLabel: '확인'
    });

**************************************************************************************************************************/