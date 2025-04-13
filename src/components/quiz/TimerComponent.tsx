import React from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  Slider,
  Tooltip,
  Typography,
  FormControlLabel,
  Switch
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import TimerIcon from '@mui/icons-material/Timer';

interface TimerComponentProps {
  timerEnabled: boolean;
  timerActive: boolean;
  timerPaused: boolean;
  timeLeft: number;
  maxTime: number;
  showingAnswer: boolean;
  reviewTime: number;
  reviewCountdown: number;
  onToggleTimer: () => void;
  onTogglePause: () => void;
  onReviewTimeChange: (event: Event, newValue: number | number[]) => void;
}

const TimerComponent: React.FC<TimerComponentProps> = ({
  timerEnabled,
  timerActive,
  timerPaused,
  timeLeft,
  maxTime,
  showingAnswer,
  reviewTime,
  reviewCountdown,
  onToggleTimer,
  onTogglePause,
  onReviewTimeChange
}) => {
  const timerProgress = (timeLeft / maxTime) * 100;
  const reviewProgress = (reviewCountdown / reviewTime) * 100;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              aria-label="Enable or disable timer"
              checked={timerEnabled}
              onChange={onToggleTimer}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon sx={{ mr: 0.5 }} />
              <Typography variant="body1">Đếm ngược thời gian</Typography>
            </Box>
          }
          labelPlacement="start"
        />

        {timerEnabled && (
          <>
            <IconButton
              onClick={onTogglePause}
              color="primary"
              disabled={
                !timerActive ||
                timeLeft === 0 ||
                showingAnswer
              }
            >
              {timerPaused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>

            <Tooltip title="Review time settings">
              <IconButton
                onClick={() => {
                  const element =
                    document.getElementById("review-time-slider");
                  if (element) {
                    element.style.display =
                      element.style.display === "none" ? "block" : "none";
                  }
                }}
                color="primary"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {timerEnabled && (
        <Box
          id="review-time-slider"
          sx={{
            px: 3,
            pt: 2,
            pb: 2,
            display: "none",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="body2" gutterBottom>
            Thời gian xem lại: {reviewTime} giây
          </Typography>
          <Slider
            value={reviewTime}
            onChange={onReviewTimeChange}
            min={3}
            max={15}
            step={1}
            marks
            valueLabelDisplay="auto"
            aria-labelledby="review-time-slider"
          />
        </Box>
      )}

      {timerEnabled && (
        <Box sx={{ px: 3, pt: 1, pb: 0 }}>
          {showingAnswer ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  color="secondary.main"
                  fontWeight="bold"
                >
                  Xem Lại:
                </Typography>
                <Typography
                  variant="body2"
                  color="secondary.main"
                  fontWeight="bold"
                >
                  {reviewCountdown} giây
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={reviewProgress}
                color="secondary"
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 2,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                  },
                }}
              />
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">Thời Gian Còn Lại:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {timeLeft} giây
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={timerProgress}
                color={timeLeft < 10 ? "error" : "primary"}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 2,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                  },
                }}
              />
            </>
          )}
        </Box>
      )}
    </>
  );
};

export default TimerComponent;