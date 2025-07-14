import axios from "axios";

/**
 * Custom log function for client logging
 */
export async function pushLogEntry(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  try {
    await axios.post(
      "http://20.244.56.144/eva1uation-service/logs",
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (truncated)",
        },
      }
    );
  } catch (err) {
    // Silently fail as per requirements (no console.warn or console.log)
  }
}
