#!/usr/bin/env python3
from __future__ import annotations

import threading
import time

from libre_remote_lab import EventLog, _ThreadingTCP, _WsHandler, lg_responder


class StandardLgWsServer:
    protocol = "lg"
    responder = staticmethod(lg_responder)
    mode = "accept"
    max_payload = 256_000
    disconnect_after_response = False
    expire_seconds = 0.25

    def __init__(self) -> None:
        self.events = EventLog()
        self._server = _ThreadingTCP(("127.0.0.1", 3000), _WsHandler)
        self._server.owner = self  # type: ignore[attr-defined]
        self.thread = threading.Thread(target=self._server.serve_forever, daemon=True)

    def run(self) -> None:
        self.thread.start()
        print("READY lg-ws 127.0.0.1:3000", flush=True)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            self._server.shutdown()
            self._server.server_close()


if __name__ == "__main__":
    StandardLgWsServer().run()
