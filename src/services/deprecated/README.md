# Deprecated Services

## websocketService.archived.js
**Deprecated Date:** 2025-09-26
**Reason:** No WebSocket backend server available. Service was non-functional.
**Replacement:** Replaced with pollingService.js for smart polling implementation.

### Migration Notes
- WebSocket connections have been replaced with 5-second polling intervals
- Use the new `usePolling` hook for real-time data updates
- All WebSocket event handlers have been converted to polling callbacks

### Original Issues
- No backend WebSocket server configured
- Service consumed resources without providing functionality
- Added unnecessary complexity to the codebase

---

Files in this directory are archived for reference only and should not be imported into active code.