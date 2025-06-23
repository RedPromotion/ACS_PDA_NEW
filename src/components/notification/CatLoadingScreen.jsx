import { Box, CircularProgress, Backdrop, }  from '@mui/material';
/**
 * @name CatLoadingScreen 
 * - 컴포넌트는 로딩 스크린 효과를 제공
 * - 배경을 흐리게 처리하고 사용자 조작을 차단하며 로딩 상태를 표시
 * 
 * @param {Object} props - 컴포넌트에 전달되는 props 객체.
 * @param {boolean} props.open - (필수) 로딩 스크린의 표시 여부를 결정합니다.
 *
 * @author sj_hong
 * @updated 2025-02-18T10:49:00Z
 * @example
 * <CatLoading
 *  open={true}
 * />
 */
export default function CatLoadingScreen ({open}) {
	return (		
		<Backdrop
			sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
			open={open}
		>
			<Box display="flex" alignItems="center" justifyContent="center">
				<CircularProgress color="inherit" />
			</Box>
		</Backdrop>		
	);
}