import { FormControl, InputLabel, Select } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";

export default function AcsSelect({height, backgroundColor, hasEmptyText, labelText, data, className, id, ...props}) {
  
  const colors = {
    Primary: "#f7b13d",
    PLight: "#efefef",
    PDark: "#8d8d8d",
    Secondary: "#ce93d8",
    SLight: "#ffc4ff",
    SDark: "#9c64a6",
    white: "#ffffff",
    black: "#000000",
    blackOpacity: "rgba(0,0,0,0.3)",
  };

  return (
    <div
      className={className}
      sx={{
        backgroundColor: backgroundColor,
        marginRight: "5px",
      }}
    >
      <FormControl
        color="primary"
        sx={{
          width: "100%",
        }}
      >
        <InputLabel
          htmlFor={id}
          shrink={true}
          sx={{
            top: "-8px",
            left: "13px",
            backgroundColor: "#ffffff",
            width: "100%",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          {labelText}
        </InputLabel>
        <Select
          labelId={id}
          id={id}
          variant="filled"
          sx={{
            height: height || "40px", // 기본 높이는 40px
          }}
          {...props}
        >
          {hasEmptyText === true && (
            <option aria-label="None" value="" sx={{ height: "20px" }} />
          )}

          {data.map((item) => (
            <option
              value={item.value}
              key={item.value}
              sx={{
                height: "20px",
                fontSize: "20px",
                padding: "8px 0 3px 10px",
                borderBottom: `1px solid ${colors.blackOpacity}`,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: colors.blackOpacity,
                },
              }}
            >
              {item.label}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

AcsSelect.defaultProps = {
  labelText: "label",
  backgroundColor: "inheritance",
  height: "40px",
  data: [],
  hasEmptyText: false,
};

AcsSelect.propTypes = {
  id: PropTypes.string.isRequired,
};
