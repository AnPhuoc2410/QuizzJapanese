import React from 'react';
import { Box, Typography } from '@mui/material';
import WrongWordsManager from './WrongWordsManager';
import { SelectChangeEvent } from '@mui/material';
import { WrongModel, Word } from '../../types';

interface QuizHeaderProps {
  currentIndex: number;
  totalCount: number;
  isWrongWordsPracticeMode: boolean;
  wrongMode: WrongModel;
  wrongWords: Word[];
  isMobile: boolean;
  onWrongModeChange: (event: SelectChangeEvent<WrongModel>) => void;
  onExitPracticeMode: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  currentIndex,
  totalCount,
  isWrongWordsPracticeMode,
  wrongMode,
  wrongWords,
  isMobile,
  onWrongModeChange,
  onExitPracticeMode
}) => {
  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 2 : 0,
      }}
    >
      <Typography variant="subtitle1">
        {isWrongWordsPracticeMode ? "Luyện tập từ sai: " : "Thẻ "}
        {currentIndex + 1} trong {totalCount}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <WrongWordsManager
          wrongMode={wrongMode}
          wrongWords={wrongWords}
          isWrongWordsPracticeMode={isWrongWordsPracticeMode}
          onWrongModeChange={onWrongModeChange}
          onExitPracticeMode={onExitPracticeMode}
        />
      </Box>
    </Box>
  );
};

export default QuizHeader;