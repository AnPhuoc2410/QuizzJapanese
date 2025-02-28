import { Button } from "@mui/material";
import { useNavigate } from "react-router";

const Starter = () => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="contained"
        sx={{ margin: 1 }}
        onClick={() => navigate("/home", { state: { isShuffle: true } })}
      >
        Shuffle
      </Button>
      <Button
        variant="outlined"
        sx={{ margin: 1 }}
        onClick={() => navigate("/home", { state: { isShuffle: false } })}
      >
        Not Shuffle
      </Button>
    </>
  );
};

export default Starter;
