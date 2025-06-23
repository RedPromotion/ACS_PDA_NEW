import { React, useState } from "react";
import { Tab, Tabs, Box, Typography } from '@mui/material';

/**
 * 여러 페이지를 탭 형식으로 구성하여 표시하는 컴포넌트 
 * 
 * @param {Object} props - 컴포넌트의 속성
 * @param {Array<string>} props.labels - 각 탭에 표시될 명칭 배열
 * @param {Array<JSX.Element>} props.pages - 각 탭에 해당하는 페이지 컴포넌트 배열
 * @param {boolean} [props.isScrollTab=false] - 스크롤 가능한 탭 여부 (기본값: false)
 * @param {boolean} [props.isBottomTab=false] - 탭을 페이지 하단에 배치할지 여부 (기본값: false)
 * 
 * @description
 * - `labels`와 `pages` 배열을 기반으로 탭 UI를 생성합니다.
 * - 선택된 탭에 따라 해당하는 페이지가 표시됩니다.
 * - `isScrollTab`을 `true`로 설정하면 탭이 스크롤 가능해집니다.
 * - `isBottomTab`을 `true`로 설정하면 탭이 하단에 배치됩니다.
 * 
 * @author sj_hong
 * @updated 2025-02-18T10:49:00Z
 * @example
 * <CatTabPages 
 *   labels={["탭 1", "탭 2", "탭 3"]} 
 *   pages={[<Page1 />, <Page2 />, <Page3 />]} 
 *   isScrollTab={true} 
 *   isBottomTab={false} 
 * />
 */
export default function CatTabPages({ labels, pages, isScrollTab=false ,isBottomTab=false }) {
    const [tabIndex, setTabIndex] = useState(0);

    /** 탭 변경 핸들러 */
    const onSetTabIndex = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    /** 탭 라벨 렌더링 */
    const onRenderTabLabel = (labels) => {
        if (Array.isArray(labels) && labels.length > 0) {
            return labels.map((label, index) => (
                <Tab key={index} label={label} />
            ));
        } 
        return <Tab label={'잘못된 labels 값'} />;
    };

    /** 탭 메뉴 렌더링 (상단/하단) */
    const renderTabMenu = (labels, isBottomTab) => (
        <Box 
            sx={{ 
                position: isBottomTab ? "absolute" : "static", 
                bottom: isBottomTab ? 0 : 'auto', 
                width: "98%" 
            }}
        >
            <Tabs 
                value={tabIndex}
                onChange={onSetTabIndex}
                variant={isScrollTab ? "scrollable" : "fullWidth"}
                scrollButtons={isScrollTab ? "auto" : false} 
                sx={{ 
                    borderColor: 'divider', 
                    [isBottomTab ? 'borderTop' : 'borderBottom']: 1 
                }}  
            >
                {onRenderTabLabel(labels)}
            </Tabs>
        </Box>
    );

    /** 선택된 탭의 페이지 렌더링 */
    const onRenderPageInTab = (pages, tabIndex) => (
        pages.map((page, index) => (
            <div key={index} hidden={tabIndex !== index}>
                {tabIndex === index && (
                    <Box>
                        <Typography component="div">{page}</Typography>
                    </Box>
                )}
            </div>
        ))
    );

    return (
        <>
            {/* 상단 탭 메뉴 */}
            {!isBottomTab && renderTabMenu(labels, false)}
            
            {/* 선택된 탭의 페이지 */}            
            {onRenderPageInTab(pages, tabIndex)}

            {/* 하단 탭 메뉴 */}
            {isBottomTab && renderTabMenu(labels, true)}
        </>
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
//탭 사용 예시
**************

// 페이지 추가
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';

    const tabList = {
        //탭 페이지 명칭 지정
        labes: ["탭 1", "탭 2", "탭 3"],
        //탭 페이지 지정
        pages:[ 
            <Tab1/>,
            <Tab2/>, 
            <Tab3/>,
        ],
    }

    // 태그 사용 
    return (
        <CatTabPages
            labels={[
                "Tab 1",
                "Tab 2",
                "Tab 3"
            ]}
            pages={[
                <Tab1 />, 
                <Tab2 />, 
                <Tab3 />
            ]}
            isScrollTab={false}
            isBottomTab={true}
        />
    )


**************************************************************************************************************************/	