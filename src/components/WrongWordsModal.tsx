import React from "react";
import { 
  Box, Button, Modal, Typography, List, ListItem, ListItemText 
} from "@mui/material";
import { Word } from "../types";
interface WrongWordsModalProps {
  open: boolean;
  onClose: () => void;
  wrongWords: Word[];
  onStartPractice?: () => void;
}

const WrongWordsModal: React.FC<WrongWordsModalProps> = ({ 
  open, 
  onClose, 
  wrongWords,
  onStartPractice 
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: 600 },
          maxHeight: "80vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Từ Sai
        </Typography>
        {wrongWords.length === 0 ? (
          <Typography>Chưa có từ sai!</Typography>
        ) : (
          <List>
            {wrongWords.map((word, idx) => (
              <ListItem key={idx} divider>
                <ListItemText 
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="h5" component="span" sx={{ fontWeight: "bold", color: "primary.main" }}>
                        {word.kanji}
                      </Typography>
                      <Typography variant="body1" component="span" sx={{ ml: 1 }} color="text.secondary">
                        {word.hiragana}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {word.meaning}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          {wrongWords.length > 0 && (
            <Button 
              onClick={onStartPractice} 
              variant="contained" 
              color="secondary" 
              fullWidth={true}
              sx={{ flex: 1 }}
            >
              Luyện Tập Từ Sai
            </Button>
          )}
          <Button 
            onClick={onClose} 
            variant="contained" 
            fullWidth
            sx={{ flex: 1 }}
          >
            Đóng
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default WrongWordsModal;
