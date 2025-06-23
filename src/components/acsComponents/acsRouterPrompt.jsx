import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Modal } from "antd";
/*******************************************************************************************	 
@Component AcsRouterPrompt.jsx
@param  {string} when 
@param  {string} onOK 
@param  {string} onCancel 
@param  {string} title 
@param  {string} okText 
@param  {string} cancelText 
@description 페이지를 떠날 때, 사용자가 이동 전 경고를 받을 수 있도록 하는 라우터 프롬프트 기능을 구현
*******************************************************************************************/
export default function AcsRouterPrompt({ when, onOK, onCancel, title, okText, cancelText }) {

  const navigate = useNavigate();

  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // 페이지 이동 차단 및 경고 메시지 처리
    if (when) {
      const unblock = navigate.block((tx) => {
        setCurrentPath(tx.pathname);
        setShowPrompt(true);
        return false; // Prevent navigation
      });

      return () => {
        unblock();
      };
    }
  }, [when, navigate]);

  const handleOK = useCallback(async () => {
    if (onOK) {
      const canRoute = await Promise.resolve(onOK());
      if (canRoute) {
        setShowPrompt(false);
        navigate(currentPath);
      }
    }
  }, [currentPath, navigate, onOK]);

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel());
      if (canRoute) {
        setShowPrompt(false);
        navigate(currentPath);
      }
    } else {
      setShowPrompt(false);
    }
  }, [currentPath, navigate, onCancel]);

  return showPrompt ? (
    <Modal
      title={title}
      visible={showPrompt}
      onOk={handleOK}
      okText={okText}
      onCancel={handleCancel}
      cancelText={cancelText}
      closable={true}
    >
      There are unsaved changes. Are you sure you want to leave this page?
    </Modal>
  ) : null;
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


<AcsRouterPrompt
  when={true}
  onOK={() => { console.log("OK clicked"); return true; }}
  onCancel={() => { console.log("Cancel clicked"); return false; }}
  title="Unsaved Changes"
  okText="Yes, Leave"
  cancelText="No, Stay"
/>



***************************************************************************************************************************/