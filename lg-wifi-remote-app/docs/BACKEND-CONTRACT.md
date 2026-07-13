# Backend contract checklist

A backend is acceptable only when it:

- does not perform network I/O on the main thread;
- has bounded queues and timeouts;
- cancels reconnection on explicit close;
- removes all credentials when a device is forgotten;
- rejects non-local URLs for local-only protocols;
- reports only capabilities that were implemented;
- normalizes errors into user-readable states;
- survives duplicate discovery results and IP changes;
- has simulator/unit tests and documented physical tests;
- has a distribution/legal review when the protocol is not a public standard.
