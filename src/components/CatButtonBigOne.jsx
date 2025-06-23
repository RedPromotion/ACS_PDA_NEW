import { Button } from "@mui/material"
/**
 * CatButtonBigOne 컴포넌트 - 좌우 너비 전부 채우는 큰 버튼 생성
 * 
 * @param {Object} props - 컴포넌트의 props
 * @param {string} props.buttonLabel - 버튼에 표시할 라벨 명칭
 * @param {React.CSSProperties} [props.buttonStyle] - 버튼 스타일 (기본값: { height: 50, fontSize: 24 })
 * @param {any} [props.rest] - 추가적인 props
 * 
 * @author sj_hong
 * @updated 2025-03-24 16:25
 * @example
 * <CatButtonBigOne 
 *    buttonLabel="Click Me" 
 *    onClick={() => {alert('Button clicked')}} 
 * />
 */
export default function CatButtonBigOne ( {buttonLabel, buttonStyle = { height: 50, fontSize: 24, }, ...Prop} ) {

    return (		
		<Button
			variant="contained"
			sx={buttonStyle}
			fullWidth			
			{...Prop}
			>
			{buttonLabel}
		</Button>		
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
		<CatButtonBigOne 
			buttonLabel="Click Me" 
			onClick={handleClick} 
		/>
	</>
)

*******************************************************************************************
//스타일 부여하여 사용하기
*************************

return (
	<>
		<CatButtonBigOne 
			buttonLabel="Click Me"
			buttonStyle={{ height:40, fontSize:20 }}
			onClick={() => alert('Button clicked')} 
		/>
	</>
)

*******************************************************************************************/	