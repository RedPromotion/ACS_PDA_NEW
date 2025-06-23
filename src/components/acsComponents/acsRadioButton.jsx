import React from "react";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { styled } from "@mui/system";

// Styled components
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  display: "block",
  width: "100%",
  fontSize: "5px",
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: "5px",
  fontSize: "10px",
}));

const StyledRadioButton = styled(FormControlLabel)(({ theme }) => ({
  fontSize: "5px",
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  fontSize: "0.8rem",
  color: "#000",
  fontWeight: "bold",
}));

const StyledLabelSpan = styled("span")(({ theme }) => ({
  fontSize: "0.8rem",
}));

// AcsRadioButton Component
export default function AcsRadioButton({ groupLabel, dataList, onChange, value, disabled }) {
  
  return (
    <StyledFormControl component="fieldset">
      <StyledFormLabel component="legend">{groupLabel}</StyledFormLabel>
      <StyledRadioGroup
        size="small"
        value={value}
        aria-label="radioGroup"
        name="radioGroup1"
        onChange={onChange}
      >
        {dataList.map((data, i) => (
          <StyledRadioButton
            key={i}
            value={data.value}
            control={<Radio size="small" />}
            label={<StyledLabelSpan>{data.label}</StyledLabelSpan>}
            labelPlacement="start"
            disabled={disabled}
          />
        ))}
      </StyledRadioGroup>
    </StyledFormControl>
  );
}

AcsRadioButton.defaultProps = {
  groupLabel: "label",
  dataList: [
    { label: "Y", value: "yes" },
    { label: "N", value: "no" },
  ],
  disabled: false,
};
