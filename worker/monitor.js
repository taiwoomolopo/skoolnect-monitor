import axios from "axios";

export async function checkWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const start = Date.now();

      await axios.get(url, { timeout: 5000 });

      return {
        status: "up",
        response_time: Date.now() - start,
      };
    } catch (err) {
      if (i === retries - 1) {
        return {
          status: "down",
          response_time: null,
          error: err.message,
        };
      }
    }
  }
}