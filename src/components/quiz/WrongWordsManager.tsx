import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Button } from '@mui/material';
import { Word, WrongModel } from '../../types';

interface WrongWordsManagerProps {
  wrongMode: WrongModel;
  wrongWords: Word[];
  isWrongWordsPracticeMode: boolean;
  onWrongModeChange: (event: SelectChangeEvent<WrongModel>) => void;
  onExitPracticeMode: () => void;
}

const WrongWordsManager: React.FC<WrongWordsManagerProps> = ({
  wrongMode,
  wrongWords,
  isWrongWordsPracticeMode,
  onWrongModeChange,
  onExitPracticeMode
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <FormControl variant="outlined" size="small">
        <InputLabel id="wrong-mode-label">Danh sách</InputLabel>
        <Select
          labelId="wrong-mode-label"
          value={wrongMode}
          onChange={onWrongModeChange}
          label="Wrong Words"
        >
          <MenuItem value="none">Thêm</MenuItem>
          <MenuItem value="review">Xem Lại</MenuItem>
          <MenuItem value="practice">Luyện Tập</MenuItem>
        </Select>
      </FormControl>

      {isWrongWordsPracticeMode && (
        <Button 
          variant="outlined" 
          color="primary"
          onClick={onExitPracticeMode}
          sx={{ ml: 2 }}
        >
          Quay Lại Danh Sách Chính
        </Button>
      )}
    </Box>
  );
};

export default WrongWordsManager;