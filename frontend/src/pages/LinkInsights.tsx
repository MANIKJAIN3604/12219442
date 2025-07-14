import React, { useEffect, useState } from "react";
import { pushLogEntry } from "../../../logging-middleware/src/logger";
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface ShortUrl {
  originalUrl: string;
  shortCode: string;
  expiry: string; // ISO string for storage
  createdAt: string; // ISO string for storage
}

interface ClickEvent {
  shortCode: string;
  timestamp: string;
  source: string;
  location: string;
}

function getShortUrls(): ShortUrl[] {
  const stored = localStorage.getItem("shortUrls");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  const session = sessionStorage.getItem("shortUrls");
  if (session) {
    try {
      return JSON.parse(session);
    } catch {
      return [];
    }
  }
  return [];
}

function getClickEvents(): ClickEvent[] {
  const stored = localStorage.getItem("clickEvents");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  const session = sessionStorage.getItem("clickEvents");
  if (session) {
    try {
      return JSON.parse(session);
    } catch {
      return [];
    }
  }
  return [];
}

function LinkInsights() {
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([]);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);
  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    pushLogEntry("frontend", "info", "page", "LinkInsights (Statistics) page loaded");
    setShortUrls(getShortUrls());
    setClickEvents(getClickEvents());
  }, []);

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(shortUrl);
    pushLogEntry("frontend", "info", "component", `Copied short URL from stats: ${shortUrl}`);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          URL Shortener Statistics
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          View analytics for all your created short URLs.
        </Typography>
        {shortUrls.length === 0 ? (
          <Alert severity="info">No short URLs created yet.</Alert>
        ) : (
          <List>
            {shortUrls.map((s, i) => {
              const clicks = clickEvents.filter((c) => c.shortCode === s.shortCode);
              return (
                <React.Fragment key={i}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <>
                          <strong>Short URL:</strong> {`${window.location.origin}/${s.shortCode}`}
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleCopy(`${window.location.origin}/${s.shortCode}`)}
                            sx={{ ml: 1 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                          {copied === `${window.location.origin}/${s.shortCode}` && (
                            <Chip label="Copied!" color="success" size="small" sx={{ ml: 1 }} />
                          )}
                        </>
                      }
                      secondary={
                        <>
                          <span>
                            <strong>Original:</strong> {s.originalUrl}
                            <br />
                            <strong>Created:</strong> {new Date(s.createdAt).toLocaleString()} | <strong>Expires:</strong> {new Date(s.expiry).toLocaleString()}
                            <br />
                            <strong>Total Clicks:</strong> {clicks.length}
                          </span>
                        </>
                      }
                    />
                  </ListItem>
                  {clicks.length > 0 && (
                    <TableContainer component={Paper} sx={{ mb: 2, mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Location</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {clicks.map((c, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(c.timestamp).toLocaleString()}</TableCell>
                              <TableCell>{c.source}</TableCell>
                              <TableCell>{c.location}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default LinkInsights;
