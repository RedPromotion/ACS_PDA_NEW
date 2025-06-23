import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Typography, DialogContentText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";

// Styled components
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1),
}));

// AcsDialogCustom Component
export default function AcsDialogCustom(props) {
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogOkayButtonDisabled, setDialogOkayButtonDisabled] = useState(false);

  // 번역 관련 메시지 설정
  useEffect(() => {
    const translatedMessage = props.translation(props.message);
    setDialogMessage(translatedMessage !== props.message ? `${translatedMessage} (${props.message})` : props.message);
  }, [props.message, props.translation]);

  // 확인 버튼 disabled 처리
  useEffect(() => {
    setDialogOkayButtonDisabled(props.open ? false : true);
  }, [props.open]);

  return (
    <Dialog aria-labelledby="customized-dialog-title" open={props.open} fullWidth>
      <StyledDialogTitle onClose={props.handleClose}>
        <Typography variant="h6">{props.translation("알림")}</Typography>
        {props.handleClose && (
          <IconButton edge="end" color="inherit" onClick={props.handleClose}>
            <CloseIcon />
          </IconButton>
        )}
      </StyledDialogTitle>
      <StyledDialogContent>
        <DialogContentText>
          {localStorage.getItem("PDA_LANG") === "ko" ? props.message : dialogMessage}
        </DialogContentText>
      </StyledDialogContent>
      <StyledDialogActions>
        {props.children}
      </StyledDialogActions>
      <div style={{ display: "flex", padding: "3px" }}>
        <Button
          onClick={props.dialogOnOkay}
          color="primary"
          fullWidth
          variant="contained"
          style={{ marginRight: "3px" }}
          disabled={dialogOkayButtonDisabled}
        >
          {props.translation("확인")}
        </Button>
        <Button
          onClick={props.dialogOnCancel}
          color="secondary"
          fullWidth
          variant="contained"
        >
          {props.translation("취소")}
        </Button>
      </div>
    </Dialog>
  );
}
