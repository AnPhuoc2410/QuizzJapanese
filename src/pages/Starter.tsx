import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router";
import ShuffleIcon from "@mui/icons-material/Shuffle";

const Starter = () => {
  const [open, setOpen] = useState(false); // State to handle dialog
  const [numberRange, setNumberRange] = useState(1); // State to handle selected number range
  const [isShuffleCustom, setIsShuffleCustom] = useState(false); // State to handle shuffle option
  const [autoNext, setAutoNext] = useState(false);
  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    // Navigate to next page with the chosen settings
    navigate("/home", { state: { numberRange, isShuffleCustom, autoNext } });
    setOpen(false);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        p: 0,
        m: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          bgcolor: "#f1f1f1",
          p: 4,
          borderRadius: 2,
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontSize: "3rem",
            mb: 2,
            color: "black",
          }}
        >
          Japanese Kanji Quiz
        </Typography>

        <Typography
          variant="body1"
          gutterBottom
          sx={{
            fontSize: "1.2rem",
            mb: 4,
            color: "black",
          }}
        >
          Bạn muốn chơi chế độ nào:
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{
            margin: 1,
            padding: "0.8rem 2rem",
            fontSize: "1rem",
            backgroundColor: "#f57c00",
            "&:hover": { backgroundColor: "#ef6c00" },
          }}
          startIcon={<ShuffleIcon />}
          onClick={() => navigate("/home", { state: { isShuffle: true } })}
        >
          Trộn thẻ
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{
            margin: 1,
            padding: "0.8rem 2rem",
            fontSize: "1rem",
            color: "#f57c00",
            borderColor: "#f57c00", // Match outline with color theme
            "&:hover": { backgroundColor: "rgba(245, 124, 0, 0.1)" },
          }}
          onClick={() => navigate("/home", { state: { isShuffle: false } })}
        >
          Không trộn thẻ
        </Button>
        <Box>
          <Button
            variant="outlined"
            size="large"
            sx={{
              margin: 1,
              padding: "0.8rem 2rem",
              fontSize: "1rem",
              backgroundColor: "#2973B2", // Custom color for better contrast
              color: "#FFFFFF",
            }}
            onClick={handleClickOpen}
          >
            Custom
          </Button>
        </Box>
      </Box>

      {/* Dialog for Custom Options */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Chọn chế độ Custom</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="number-range-label">Chọn phần</InputLabel>
            <Select
              labelId="number-range-label"
              value={numberRange}
              onChange={(e) => setNumberRange(Number(e.target.value))}
            >
              <MenuItem value={1}>Phan 1: 1 den 150</MenuItem>
              <MenuItem value={2}>Phan 2: 151 den 300</MenuItem>
              <MenuItem value={3}>Phan 3: 301 den 451</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={isShuffleCustom}
                onChange={(e) => setIsShuffleCustom(e.target.checked)}
              />
            }
            label="Trộn thẻ"
            sx={{ mt: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={autoNext}
                onChange={(e) => setAutoNext(e.target.checked)}
              />
            }
            label="Chuyển thẻ tự động　(đáp án đúng)"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleConfirm} variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Starter;
