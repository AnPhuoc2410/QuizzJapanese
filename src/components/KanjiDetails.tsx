import React from "react";
import { Box, Typography } from "@mui/material";

interface KanjiDetailsProps {
  meaning: string | null;
  onyomi: string;
  kunyomi: string;
  kanjiAnimation: string[];
  kanjiVideo: string | null;
  isMobile?: boolean;
  isTablet?: boolean;
}

const KanjiDetails: React.FC<KanjiDetailsProps> = ({
  meaning,
  onyomi,
  kunyomi,
  kanjiAnimation,
  kanjiVideo,
  isMobile = false,
  isTablet = false,
}) => {
  return (
    <>
      {kanjiVideo && kanjiVideo.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            mb: isMobile ? 2 : 3,
            p: isMobile ? 1 : 2,
            bgcolor: "#fff",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <video
            src={kanjiVideo}
            controls
            autoPlay
            loop
            style={{ 
              width: isMobile ? 120 : isTablet ? 140 : 160, 
              height: isMobile ? 120 : isTablet ? 140 : 160 
            }}
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
      {meaning && (
        <>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              textAlign: "center",
              mb: isMobile ? 1 : 2,
              fontWeight: "medium",
              bgcolor: "#f9f9f9",
              p: isMobile ? 1 : 2,
              borderRadius: 2,
              fontSize: isMobile ? "1rem" : isTablet ? "1.2rem" : undefined,
            }}
          >
            Ý nghĩa: <strong>{meaning}</strong>
          </Typography>
          <Typography
            sx={{
              p: isMobile ? 1 : 2,
              gap: isMobile ? 1 : 3,
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              flexDirection: isMobile ? "column" : "row",
              fontSize: isMobile ? "0.9rem" : isTablet ? "1rem" : undefined,
            }}
          >
            Onyomi: <strong>{onyomi}</strong> 
            {isMobile ? null : " | "}
            Kunyomi: <strong>{kunyomi}</strong>
          </Typography>
        </>
      )}
      {kanjiAnimation.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: isMobile ? "5px" : "10px",
            flexWrap: "wrap",
            mb: isMobile ? 2 : 3,
            p: isMobile ? 1 : 2,
            bgcolor: "#fff",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          {kanjiAnimation.map((frame, idx) => (
            <img
              key={idx}
              src={frame}
              alt={`Stroke ${idx}`}
              style={{ 
                width: isMobile ? 50 : isTablet ? 60 : 70, 
                height: isMobile ? 50 : isTablet ? 60 : 70 
              }}
            />
          ))}
        </Box>
      )}
    </>
  );
};

export default KanjiDetails;