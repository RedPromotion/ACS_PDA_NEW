import { React, useEffect } from "react";
import { Button, Box } from "@mui/material";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
/**
 * CatFileUploadButton 컴포넌트는 좌우 너비를 꽉 채우는 Row 1개를 차지하는 파일 업로드 버튼을 생성합니다.
 * @param {Object} props - 컴포넌트에 전달되는 props 객체
 * @param {string} props.buttonLabel - 버튼에 표시될 텍스트
 * @param {boolean} props.isSave - 저장 버튼이 눌렸는지 여부
 * @param {Array<any>} props.saveFiles - 저장할 파일 목록
 * @param {Function} props.setSaveFiles - 저장 파일 목록을 업데이트하는 함수
 * @param {string} props.saveFilesName - 저장 파일 이름
 * @param {Function} props.setSaveFilesName - 저장 파일 이름을 업데이트하는 함수
 * @param {string} props.statusMessage - 상태 메시지
 * @param {Function} props.setStatusMessage - 상태 메시지를 업데이트하는 함수
 * @param {Object} [props.Prop] - 추가 옵션 속성 (추가 props)
 */
export default function CatFileUploadButton({ buttonLabel, isSave, saveFiles, setSaveFiles, saveFilesName, setSaveFilesName, statusMessage, setStatusMessage, ...Prop }) {

	const VisuallyHiddenInput = styled('input')({
		clip: 'rect(0 0 0 0)',
		clipPath: 'inset(50%)',
		height: 1,
		overflow: 'auto',
		position: 'absolute',
		bottom: 0,
		left: 0,
		whiteSpace: 'nowrap',
		width: 1,
	});

	useEffect(() => {
		setSaveFiles([]);
		setSaveFilesName("");
	}, [isSave]);

	const handleDelete = () => {
		setStatusMessage(`${saveFilesName} 삭제되었습니다.`);
		setSaveFiles([]);
		setSaveFilesName("");
	}

	// 파일 업로드 누르면 saveFiles에 저장 이벤트
	const btnFileSaveOnChange = (event) => {
		const files = event.target.files;
		if(!files || files.length === 0) {
			return;
		}
		// 파일이 1개 이상일 경우 1개만 선택할 수 있음
		if (files.length > 1) {
			setStatusMessage(`파일은 1장만 선택 가능합니다.`);
			return;
		}

		setSaveFiles(event.target.files[0]);
		setSaveFilesName(event.target.files[0].name);
		setStatusMessage(``);
		// 파일이 선택되지 않았거나 취소된 경우

	}

	useEffect(() => {
		console.log(saveFilesName);	
	})
	

	return (
		<Box gap={1} mt={2} mb={1} mr={1} ml={1}>
			<Button
				component="label"
				role={undefined}
				variant="contained"
				tabIndex={-1}
				startIcon={<CloudUploadIcon />}
				sx={{ height: 50, fontSize: 24, }}
				fullWidth
			>
				{buttonLabel}
				<input
					type="file"
					style={{ display: "none" }} // VisuallyHiddenInput 대체
					onChange={(event) => btnFileSaveOnChange(event)}
					multiple
					{...Prop}
				/>
			</Button>
			<div style={{ margin: 10 }}>
				{saveFilesName ? (
					<>
						{saveFilesName}
						<a
							style={{ marginLeft: 5, color:'red' }}
							onClick={() => handleDelete()}
						>
							X
						</a>
					</>
				) : (
					''
				)}
			</div>
		</Box>
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


	const [isSave, setIsSave] = useState(false);//저장 버튼 클릭 
	
return (
	<>
		<Button_FileUpload
				buttonLabel={"보수후 사진 업로드"}
				isSave={isSave}
		/>
	</>
	)

*******************************************************************************************/	