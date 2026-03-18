import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import React from "react";
import IconButton from "@mui/material/IconButton";
import { useAtom } from "jotai";
import { isOpeningAll } from "../atoms/atoms";

export default function AlertViewer() {
  const [openingall, setOpeningAll] = useAtom(isOpeningAll);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpeningAll({
      opening: false,
      severity: "success",
      alerttext: "",
    });
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <svg
          classN="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      open={openingall.opening}
      autoHideDuration={3000}
      onClose={handleClose}
      action={action}
    >
      <Alert
        onClose={handleClose}
        severity={openingall.severity}
        sx={{ width: "100%" }}
      >
        {openingall.alerttext}
      </Alert>
    </Snackbar>
  );
}
