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

// AcsDialog Component
export default function AcsDialog(props) {
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    const translatedMessage = props.translation(props.message);
    setDialogMessage(translatedMessage !== props.message ? `${translatedMessage} (${props.message})` : props.message);
  }, [props.message, props.translation]);

  return (
    <Dialog onClose={props.handleClose} open={props.open} fullWidth>
      <StyledDialogTitle onClose={props.handleClose}>
        <Typography variant="h6">{props.translation("알림")}</Typography>
        {props.handleClose && (
          <IconButton edge="end" color="inherit" onClick={props.handleClose}>
            <CloseIcon />
          </IconButton>
        )}
      </StyledDialogTitle>
      <StyledDialogContent>
        <DialogContentText>{localStorage.getItem("PDA_LANG") === "ko" ? props.message : dialogMessage}</DialogContentText>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={props.handleClose} color="secondary" fullWidth variant="contained">
          {props.translation("닫기")}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
}
