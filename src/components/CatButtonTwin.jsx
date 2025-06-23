import { FormControl, Box, Button, }  from '@mui/material';
/**
 * CatButtonTwin 좌우 너비를 전부 채우는 2개의 버튼을 생성합니다.  
 * 
 * @param {Object} props - 컴포넌트의 props
 * @param {string} [props.textLeft=""] - 좌측 버튼 라벨, 미입력 시 공백
 * @param {string} [props.textRight=""] - 우측 버튼 라벨, 미입력 시 공백
 * @param {function} [props.onClickLeft] - 좌측 버튼 이벤트 핸들러
 * @param {function} [props.onClickRight] - 우측 버튼 이벤트 핸들러
 * @param {number} [props.gap] - 버튼 사이의 간격 크기 설정 (기본1)
 * @param {Object} [props.buttonStyle={height: "50px", fontSize: "24px"}] - 버튼 공통 스타일 설정 
 * 
 * @author sj_hong
 * @updated 2025-03-24 16:28
 * @example
 * <CatButtonTwin
 *   textLeft="왼쪽 버튼"
 *   textRight="오른쪽 버튼"
 *   onClickLeft={() => {alert('left Button clicked')}}
 *   onClickRight={() => {alert('right Button clicked')}}
 * />
 */
export default function CatButtonTwin ( {textLeft = "", textRight = "", onClickLeft, onClickRight, gap = 1 ,buttonStyle={ height: "50px", fontSize: '24px' }} ) {

	//버튼 클릭 이벤트
	const handleEvent_btnLeft = () => {
		if (typeof onClickLeft === "function") {
			onClickLeft();
		} 
		else {
			console.warn("onClick_Left는 함수가 아닙니다.");
		}
		 // ...이벤트 추가 가능		 
	};


	// 버튼 클릭 이벤트
	const handleEvent_btnRight = () => {
		if (typeof onClickRight === "function") {
			onClickRight();
		} 
		else {
			console.warn("onClick_Right는 함수가 아닙니다.");
		}
		// ...이벤트 추가 가능
	};

    return (
		<FormControl fullWidth>			
			<Box display="flex" gap={gap}>
				<Button 
					variant="contained" 
					sx={buttonStyle}
					fullWidth 
					onClick={handleEvent_btnLeft}
				>
				{textLeft}
				</Button>
				<Button 
					variant="contained" 
					sx={buttonStyle}
					fullWidth 
					onClick={handleEvent_btnRight}				
				>
				{textRight}
				</Button>
			</Box>
		</FormControl>
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

//상위 페이지에서의 코드 사용 예시
***********************************

	return (
	<>
		<CatButtonTwin 
			txt_Left = ""
			txt_Right = ""
			onClick_Left={}
			onClick_Right={}
		/>
	</>
	)

*******************************************************************************************/	
