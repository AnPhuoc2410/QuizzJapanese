import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import ShuffleIcon from '@mui/icons-material/Shuffle';

const Starter = () => {
  const navigate = useNavigate();

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
      </Box>
    </Box>
  );
};

export default Starter;
