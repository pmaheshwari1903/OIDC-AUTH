// --------------------------------------------------
// Anomaly Detection Configuration
// --------------------------------------------------
// These thresholds define when client behavior is flagged.
// Adjust these values based on your platform's expected traffic.

// Rule 1: High Access Frequency
// Flag if a client makes more than this many requests within the time window
export const ANOMALY_ACCESS_THRESHOLD = 100;
export const ANOMALY_TIME_WINDOW_MINUTES = 5;

// Rule 2: High Denial Rate
// Flag if this percentage (0.0 to 1.0) or more of a client's requests are denied
export const ANOMALY_DENIAL_RATE = 0.70;

// Rule 3: Scope Spike
// Flag if a client's distinct scope count in the recent window exceeds
// this multiple of their historical average
export const ANOMALY_SCOPE_SPIKE_MULTIPLIER = 2;

// Minimum number of requests needed before anomaly rules apply
export const ANOMALY_MIN_REQUESTS = 10;
