import React from "react";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { SxProps, Theme } from "@mui/material/styles";

// Define the button types
type ButtonType = "prev" | "check" | "next";

// Props interface with TypeScript types
interface NavigationButtonProps {
  type: ButtonType;
  onClick: () => void;
  disabled?: boolean;
  isMobile?: boolean;
  sx?: SxProps<Theme>;
  customText?: string;
}

/**
 * A reusable button component for navigation and actions.
 */
const NavigationButton: React.FC<NavigationButtonProps> = ({
  type,
  onClick,
  disabled = false,
  isMobile = false,
  sx = {},
  customText,
}) => {
  // Button configuration based on type
  const buttonConfig = {
    prev: {
      variant: "outlined" as const,
      color: "default" as const,
      text: customText || "Từ trước đó",
      icon: <ArrowBackIcon />,
      iconPosition: "start" as const,
    },
    check: {
      variant: "contained" as const,
      color: "primary" as const,
      text: customText || "Kiểm tra",
      icon: <CheckCircleIcon />,
      iconPosition: "end" as const,
      fontWeight: "bold",
    },
    next: {
      variant: "outlined" as const,
      color: "secondary" as const,
      text: customText || "Từ tiếp theo",
      icon: <ArrowForwardIcon />,
      iconPosition: "end" as const,
    },
  };

  const config = buttonConfig[type];

  // Common styles to apply to all buttons
  const commonSx: SxProps<Theme> = {
    py: 1.5,
    fontSize: "1rem",
    borderRadius: 2,
    ...("fontWeight" in config && { fontWeight: config.fontWeight }),
    ...sx,
  };

  return (
    <Button
      variant={config.variant}
      size="large"
      color={config.color === "default" ? undefined : config.color}
      {...(config.iconPosition === "start"
        ? { startIcon: config.icon }
        : { endIcon: config.icon })}
      onClick={onClick}
      disabled={disabled}
      fullWidth={isMobile}
      sx={commonSx}
    >
      {config.text}
    </Button>
  );
};

export default NavigationButton;
