import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pushLogEntry } from "../../../logging-middleware/src/logger";
import { Box, CircularProgress, Typography, Paper, Alert, Button } from "@mui/material";

interface ShortUrl {
  originalUrl: string;
  shortCode: string;
  expiry: string; // ISO string for storage
  createdAt: string; // ISO string for storage
}

function ShortlinkRedirect() {
  const { aliasCode } = useParams<{ aliasCode: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error" | "expired" | "success">("loading");
  const [message, setMessage] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState<string>("");

  useEffect(() => {
    pushLogEntry("frontend", "info", "page", `ShortlinkRedirect page loaded for code: ${aliasCode}`);
    if (!aliasCode) {
      setStatus("error");
      setMessage("No shortcode provided in the URL.");
      pushLogEntry("frontend", "error", "component", "No shortcode provided in the URL.");
      return;
    }
    // Try to get shortUrls from localStorage (for persistence across reloads)
    const stored = localStorage.getItem("shortUrls");
    let shortUrls: ShortUrl[] = [];
    if (stored) {
      try {
        shortUrls = JSON.parse(stored);
      } catch {
        // fallback: ignore
      }
    }
    // Fallback to session state if not found in localStorage
    if (!shortUrls.length) {
      const session = sessionStorage.getItem("shortUrls");
      if (session) {
        try {
          shortUrls = JSON.parse(session);
        } catch {
          // fallback: ignore
        }
      }
    }
    const found = shortUrls.find((s) => s.shortCode === aliasCode);
    if (!found) {
      setStatus("error");
      setMessage("Short URL not found.");
      pushLogEntry("frontend", "error", "component", `Shortcode not found: ${aliasCode}`);
      return;
    }
    const now = new Date();
    const expiry = new Date(found.expiry);
    if (now > expiry) {
      setStatus("expired");
      setMessage("This short URL has expired.");
      pushLogEntry("frontend", "info", "component", `Shortcode expired: ${aliasCode}`);
      return;
    }
    setTargetUrl(found.originalUrl);
    setStatus("success");
    // Track click event
    const clickEvent = {
      shortCode: aliasCode,
      timestamp: new Date().toISOString(),
      source: "direct",
      location: "Unknown", // Placeholder; can be enhanced with geolocation APIs
    };
    // Save click event to localStorage
    let clickEvents: any[] = [];
    try {
      const storedClicks = localStorage.getItem("clickEvents");
      if (storedClicks) clickEvents = JSON.parse(storedClicks);
    } catch {}
    clickEvents.push(clickEvent);
    localStorage.setItem("clickEvents", JSON.stringify(clickEvents));
    pushLogEntry("frontend", "info", "component", `Click tracked for shortcode: ${aliasCode}`);
    pushLogEntry("frontend", "info", "component", `Redirecting to original URL for shortcode: ${aliasCode}`);
    setTimeout(() => {
      window.location.href = found.originalUrl;
    }, 1500);
  }, [aliasCode]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 350, textAlign: "center" }}>
        {status === "loading" && (
          <>
            <CircularProgress />
            <Typography variant="h6" mt={2}>Redirecting...</Typography>
          </>
        )}
        {status === "success" && (
          <>
            <Alert severity="success">Redirecting to: {targetUrl}</Alert>
            <Typography variant="body2" mt={2}>If you are not redirected, <Button onClick={() => window.location.href = targetUrl}>click here</Button>.</Typography>
          </>
        )}
        {status === "expired" && (
          <Alert severity="warning">{message}</Alert>
        )}
        {status === "error" && (
          <Alert severity="error">{message}</Alert>
        )}
      </Paper>
    </Box>
  );
}

export default ShortlinkRedirect;
