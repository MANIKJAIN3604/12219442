import React, { useEffect, useState } from "react";
import { pushLogEntry } from "../../../logging-middleware/src/logger";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface ShortUrl {
  originalUrl: string;
  shortCode: string;
  expiry: Date;
  createdAt: Date;
}

const DEFAULT_VALIDITY = 30; // minutes
const MAX_URLS = 5;
const SHORTCODE_REGEX = /^[a-zA-Z0-9]{3,12}$/;

function generateRandomShortcode(existing: Set<string>): string {
  let code = "";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (existing.has(code));
  return code;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function Dashboard() {
  const [inputs, setInputs] = useState([
    { url: "", validity: "", shortcode: "" },
  ]);
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    pushLogEntry("frontend", "info", "page", "Dashboard page loaded");
  }, []);

  const handleInputChange = (idx: number, field: string, value: string) => {
    setInputs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleAddInput = () => {
    if (inputs.length < MAX_URLS) {
      setInputs((prev) => [...prev, { url: "", validity: "", shortcode: "" }]);
      pushLogEntry("frontend", "info", "component", "Added new URL input field");
    }
  };

  const handleRemoveInput = (idx: number) => {
    setInputs((prev) => prev.filter((_, i) => i !== idx));
    pushLogEntry("frontend", "info", "component", `Removed URL input field at index ${idx}`);
  };

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    setSuccess("Short URL copied to clipboard!");
    pushLogEntry("frontend", "info", "component", `Copied short URL: ${shortUrl}`);
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess("");
    const newShortUrls: ShortUrl[] = [];
    const errorList: string[] = [];
    const usedShortcodes = new Set(shortUrls.map((s) => s.shortCode));
    // Validate and process each input
    inputs.forEach((input, idx) => {
      if (!input.url.trim()) {
        errorList.push(`Row ${idx + 1}: URL is required.`);
        pushLogEntry("frontend", "error", "component", `URL missing at row ${idx + 1}`);
        return;
      }
      if (!isValidUrl(input.url.trim())) {
        errorList.push(`Row ${idx + 1}: Invalid URL format.`);
        pushLogEntry("frontend", "error", "component", `Invalid URL at row ${idx + 1}: ${input.url}`);
        return;
      }
      let validity = DEFAULT_VALIDITY;
      if (input.validity) {
        const v = parseInt(input.validity, 10);
        if (isNaN(v) || v <= 0) {
          errorList.push(`Row ${idx + 1}: Validity must be a positive integer.`);
          pushLogEntry("frontend", "error", "component", `Invalid validity at row ${idx + 1}: ${input.validity}`);
          return;
        }
        validity = v;
      }
      let shortCode = "";
      if (input.shortcode) {
        if (!SHORTCODE_REGEX.test(input.shortcode)) {
          errorList.push(`Row ${idx + 1}: Shortcode must be 3-12 alphanumeric characters.`);
          pushLogEntry("frontend", "error", "component", `Invalid shortcode at row ${idx + 1}: ${input.shortcode}`);
          return;
        }
        if (usedShortcodes.has(input.shortcode)) {
          errorList.push(`Row ${idx + 1}: Shortcode '${input.shortcode}' already exists.`);
          pushLogEntry("frontend", "error", "component", `Shortcode collision at row ${idx + 1}: ${input.shortcode}`);
          return;
        }
        shortCode = input.shortcode;
      } else {
        shortCode = generateRandomShortcode(usedShortcodes);
      }
      usedShortcodes.add(shortCode);
      const now = new Date();
      const expiry = new Date(now.getTime() + validity * 60000);
      newShortUrls.push({
        originalUrl: input.url.trim(),
        shortCode,
        expiry,
        createdAt: now,
      });
      pushLogEntry(
        "frontend",
        "info",
        "component",
        `Short URL created: ${shortCode} for ${input.url.trim()} (valid ${validity} min)`
      );
    });
    if (errorList.length > 0) {
      setErrors(errorList);
      return;
    }
    setShortUrls((prev) => [...prev, ...newShortUrls]);
    setInputs([{ url: "", validity: "", shortcode: "" }]);
    setSuccess("Short URLs created successfully!");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          URL Shortener
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Shorten up to 5 URLs at a time. Optionally set validity (minutes) and custom shortcode.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {inputs.map((input, idx) => (
              <React.Fragment key={idx}>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="Long URL"
                    value={input.url}
                    onChange={(e) => handleInputChange(idx, "url", e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    label="Validity (min)"
                    value={input.validity}
                    onChange={(e) => handleInputChange(idx, "validity", e.target.value)}
                    fullWidth
                    placeholder={`${DEFAULT_VALIDITY}`}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Custom Shortcode"
                    value={input.shortcode}
                    onChange={(e) => handleInputChange(idx, "shortcode", e.target.value)}
                    fullWidth
                    placeholder="(optional)"
                  />
                </Grid>
                <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center" }}>
                  {inputs.length > 1 && (
                    <Button
                      color="error"
                      onClick={() => handleRemoveInput(idx)}
                      variant="outlined"
                    >
                      Remove
                    </Button>
                  )}
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleAddInput}
                disabled={inputs.length >= MAX_URLS}
                sx={{ mr: 2 }}
              >
                Add URL
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Shorten
              </Button>
            </Grid>
          </Grid>
        </form>
        {errors.length > 0 && (
          <Box mt={2}>
            {errors.map((err, i) => (
              <Alert severity="error" key={i} sx={{ mb: 1 }}>
                {err}
              </Alert>
            ))}
          </Box>
        )}
        {success && (
          <Box mt={2}>
            <Alert severity="success">{success}</Alert>
          </Box>
        )}
        {shortUrls.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Shortened URLs
            </Typography>
            <List>
              {shortUrls.map((s, i) => (
                <React.Fragment key={i}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleCopy(`${window.location.origin}/${s.shortCode}`)}>
                        <ContentCopyIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <>
                          <strong>Short URL:</strong> {`${window.location.origin}/${s.shortCode}`} <br />
                          <strong>Original:</strong> {s.originalUrl}
                        </>
                      }
                      secondary={
                        <>
                          <span>
                            <strong>Created:</strong> {s.createdAt.toLocaleString()} | <strong>Expires:</strong> {s.expiry.toLocaleString()}
                          </span>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard;
