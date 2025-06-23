import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

export default function AcsCheckBox({ label, ...props }) {
    return (
        <FormControlLabel
            {...props}
            control={<Checkbox />}
            label={label}
        />
    );
}