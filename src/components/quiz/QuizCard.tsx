import React, { memo } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import KanjiDetails from '../KanjiDetails';
import NavigationButton from '../ButtonComponent';

interface QuizCardProps {
  currentKanji: string;
  meaning: string | null;
  onyomi: string;
  kunyomi: string;
  kanjiAnimation: any[];
  kanjiVideo: string | null;
  input: string;
  message: string;
  showingAnswer: boolean;
  timeLeft: number;
  isMobile: boolean;
  isTablet: boolean;
  countdown: number | null;
  onInputChange: (value: string) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  onPrevWord: () => void;
  onCheckAnswer: () => void;
  onNextWord: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({
  currentKanji,
  meaning,
  onyomi,
  kunyomi,
  kanjiAnimation,
  kanjiVideo,
  input,
  message,
  showingAnswer,
  timeLeft,
  isMobile,
  isTablet,
  countdown,
  onInputChange,
  onKeyPress,
  onPrevWord,
  onCheckAnswer,
  onNextWord
}) => {
  return (
    <>
      {showingAnswer && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "#fff8e1",
            borderRadius: 2,
            border: "1px solid #ffe082",
          }}
        >
          <Typography variant="body1" color="secondary">
            Thời gian xem: Chuyển sang thẻ tiếp theo trong{" "}
            {/*state.reviewCountdown*/} giây...
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: isMobile ? 2 : 4, mt: isMobile ? 1 : 2 }}>
        <Typography
          variant="h1"
          sx={{
            textAlign: "center",
            fontSize: isMobile ? "clamp(1.5rem, 5vw, 2.5rem)" : "7rem",
            lineHeight: 1.2,
            mb: isMobile ? 2 : 3,
          }}
        >
          {currentKanji}
        </Typography>

        <KanjiDetails
          meaning={meaning}
          onyomi={onyomi}
          kunyomi={kunyomi}
          kanjiAnimation={kanjiAnimation}
          kanjiVideo={kanjiVideo}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      </Box>

      <TextField
        label="Nhập Hiragana"
        variant="outlined"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={onKeyPress}
        fullWidth
        disabled={timeLeft === 0 || showingAnswer}
        InputProps={{
          style: { fontSize: "1.2rem" },
        }}
        InputLabelProps={{
          style: { fontSize: "1.2rem" },
        }}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            height: isMobile ? 56 : 64,
          },
        }}
      />

      {countdown !== null && (
        <Typography
          variant="h6"
          color="primary"
          sx={{
            textAlign: "center",
            marginBottom: isMobile ? 2 : 1,
            height: 40,
            fontWeight: "bold",
            fontSize: isMobile ? "1rem" : "1.5rem",
          }}
        >
          Chuyển sang câu hỏi tiếp theo trong {countdown} giây...
        </Typography>
      )}

      <Typography
        variant="h5"
        color={
          message.includes("✅") ? "success.main" : "error.main"
        }
        sx={{
          textAlign: "center",
          marginBottom: isMobile ? 2 : 1,
          height: 40,
          fontWeight: "bold",
          fontSize: isMobile ? "1rem" : "1.5rem",
        }}
      >
        {message}
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <NavigationButton
          type="prev"
          onClick={onPrevWord}
          isMobile={isMobile}
        />
        <NavigationButton
          type="check"
          onClick={onCheckAnswer}
          disabled={timeLeft === 0 || showingAnswer}
          isMobile={isMobile}
        />
        <NavigationButton
          type="next"
          onClick={onNextWord}
          isMobile={isMobile}
        />
      </Box>
    </>
  );
};

export default memo(QuizCard);