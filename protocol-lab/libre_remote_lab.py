#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import hashlib
import http.client
import http.server
import json
import os
import shutil
import socket
import socketserver
import ssl
import struct
import subprocess
import tempfile
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable


GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"


def _recv_until(sock: socket.socket, marker: bytes, limit: int = 64_000) -> bytes:
    data = bytearray()
    while marker not in data:
        chunk = sock.recv(4096)
        if not chunk:
            break
        data.extend(chunk)
        if len(data) > limit:
            raise ValueError("request header exceeded limit")
    return bytes(data)


def _read_exact(sock: socket.socket, n: int) -> bytes:
    out = bytearray()
    while len(out) < n:
        chunk = sock.recv(n - len(out))
        if not chunk:
            raise EOFError("socket closed")
        out.extend(chunk)
    return bytes(out)


def read_ws_text(sock: socket.socket, max_payload: int = 256_000) -> str:
    head = _read_exact(sock, 2)
    opcode = head[0] & 0x0F
    if opcode == 8:
        raise EOFError("websocket close")
    if opcode != 1:
        raise ValueError(f"expected text frame, opcode={opcode}")
    masked = (head[1] & 0x80) != 0
    length = head[1] & 0x7F
    if length == 126:
        length = struct.unpack("!H", _read_exact(sock, 2))[0]
    elif length == 127:
        length = struct.unpack("!Q", _read_exact(sock, 8))[0]
    if length > max_payload:
        raise ValueError("websocket payload exceeded limit")
    mask = _read_exact(sock, 4) if masked else b""
    payload = bytearray(_read_exact(sock, length))
    if masked:
        for i in range(length):
            payload[i] ^= mask[i % 4]
    return payload.decode("utf-8")


def send_ws_text(sock: socket.socket, text: str) -> None:
    data = text.encode("utf-8")
    header = bytearray([0x81])
    if len(data) < 126:
        header.append(len(data))
    elif len(data) <= 0xFFFF:
        header.append(126)
        header.extend(struct.pack("!H", len(data)))
    else:
        header.append(127)
        header.extend(struct.pack("!Q", len(data)))
    sock.sendall(header + data)


def ws_client_frame(text: str) -> bytes:
    data = text.encode("utf-8")
    mask = b"\x11\x22\x33\x44"
    header = bytearray([0x81])
    if len(data) < 126:
        header.append(0x80 | len(data))
    elif len(data) <= 0xFFFF:
        header.append(0x80 | 126)
        header.extend(struct.pack("!H", len(data)))
    else:
        header.append(0x80 | 127)
        header.extend(struct.pack("!Q", len(data)))
    encoded = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
    return bytes(header) + mask + encoded


@dataclass
class LabEvent:
    protocol: str
    kind: str
    payload: dict


class EventLog:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.events: list[LabEvent] = []

    def add(self, protocol: str, kind: str, **payload: object) -> None:
        with self._lock:
            self.events.append(LabEvent(protocol, kind, dict(payload)))

    def count(self, protocol: str, kind: str) -> int:
        with self._lock:
            return sum(1 for e in self.events if e.protocol == protocol and e.kind == kind)


class _WsHandler(socketserver.BaseRequestHandler):
    def handle(self) -> None:
        server: "FakeWebSocketServer" = self.server.owner  # type: ignore[attr-defined]
        sock = self.request
        raw = _recv_until(sock, b"\r\n\r\n")
        text = raw.decode("iso-8859-1", errors="replace")
        headers: dict[str, str] = {}
        for line in text.split("\r\n")[1:]:
            if ":" in line:
                k, v = line.split(":", 1)
                headers[k.strip().lower()] = v.strip()
        key = headers.get("sec-websocket-key")
        if not key:
            return
        accept = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
        sock.sendall(
            ("HTTP/1.1 101 Switching Protocols\r\n"
             "Upgrade: websocket\r\n"
             "Connection: Upgrade\r\n"
             f"Sec-WebSocket-Accept: {accept}\r\n\r\n").encode("ascii")
        )
        server.events.add(server.protocol, "connected", peer=str(self.client_address))
        if server.mode == "expire":
            time.sleep(server.expire_seconds)
            return
        while True:
            try:
                message = read_ws_text(sock, server.max_payload)
            except (EOFError, OSError):
                break
            except Exception as exc:
                server.events.add(server.protocol, "rejected", error=type(exc).__name__)
                break
            server.events.add(server.protocol, "message", text=message)
            response = server.responder(message, server.mode)
            if response is None:
                continue
            send_ws_text(sock, response)
            if server.disconnect_after_response:
                break


class _ThreadingTCP(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


class FakeWebSocketServer:
    def __init__(
        self,
        protocol: str,
        responder: Callable[[str, str], str | None],
        *,
        mode: str = "accept",
        tls_context: ssl.SSLContext | None = None,
        max_payload: int = 256_000,
        disconnect_after_response: bool = False,
        expire_seconds: float = 0.25,
    ) -> None:
        self.protocol = protocol
        self.responder = responder
        self.mode = mode
        self.events = EventLog()
        self.max_payload = max_payload
        self.disconnect_after_response = disconnect_after_response
        self.expire_seconds = expire_seconds
        self._server = _ThreadingTCP(("127.0.0.1", 0), _WsHandler)
        self._server.owner = self  # type: ignore[attr-defined]
        if tls_context:
            self._server.socket = tls_context.wrap_socket(self._server.socket, server_side=True)
        self.thread = threading.Thread(target=self._server.serve_forever, daemon=True)

    @property
    def port(self) -> int:
        return int(self._server.server_address[1])

    def start(self) -> "FakeWebSocketServer":
        self.thread.start()
        return self

    def close(self) -> None:
        self._server.shutdown()
        self._server.server_close()
        self.thread.join(timeout=2)

    def __enter__(self) -> "FakeWebSocketServer":
        return self.start()

    def __exit__(self, *_: object) -> None:
        self.close()


def lg_responder(message: str, mode: str) -> str | None:
    try:
        data = json.loads(message)
    except json.JSONDecodeError:
        return json.dumps({"type": "error", "error": "invalid-json"})
    if mode == "deny":
        return json.dumps({"type": "error", "error": "pairing denied"})
    if data.get("type") == "register":
        return json.dumps({"type": "registered", "payload": {"client-key": "lab-client-key"}})
    return json.dumps({"type": "response", "id": data.get("id", "1"), "payload": {"returnValue": True}})


def samsung_responder(message: str, mode: str) -> str | None:
    if mode == "deny":
        return json.dumps({"event": "ms.channel.unauthorized"})
    try:
        data = json.loads(message)
    except json.JSONDecodeError:
        return json.dumps({"event": "ms.error", "data": {"message": "invalid-json"}})
    key = (((data.get("params") or {}).get("DataOfCmd")))
    return json.dumps({"event": "ms.remote.ack", "data": {"key": key, "token": "lab-token"}})


DEVICE_XML = """<?xml version="1.0"?>
<root xmlns="urn:schemas-upnp-org:device-1-0">
  <device>
    <deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>
    <friendlyName>Libre Lab Renderer</friendlyName>
    <manufacturer>Libre Remote Lab</manufacturer>
    <UDN>uuid:libre-lab-renderer-001</UDN>
    <serviceList>
      <service>
        <serviceType>urn:schemas-upnp-org:service:AVTransport:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:AVTransport</serviceId>
        <controlURL>/control/av</controlURL>
      </service>
      <service>
        <serviceType>urn:schemas-upnp-org:service:RenderingControl:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:RenderingControl</serviceId>
        <controlURL>/control/render</controlURL>
      </service>
    </serviceList>
  </device>
</root>
"""


class _DlnaHandler(http.server.BaseHTTPRequestHandler):
    server_version = "LibreRemoteLab/1"

    def log_message(self, *_: object) -> None:
        return

    @property
    def owner(self) -> "FakeDlnaServer":
        return self.server.owner  # type: ignore[attr-defined]

    def do_GET(self) -> None:
        if self.path == "/device.xml":
            body = DEVICE_XML.encode()
            content_type = "text/xml; charset=utf-8"
        elif self.path == "/malformed.xml":
            body = b"<root><device><friendlyName>broken"
            content_type = "text/xml"
        elif self.path == "/entity.xml":
            body = b"<!DOCTYPE x [<!ENTITY y SYSTEM 'file:///etc/passwd'>]><x>&y;</x>"
            content_type = "text/xml"
        elif self.path == "/oversized.xml":
            body = ("<root><x>" + "a" * 300_000 + "</x></root>").encode()
            content_type = "text/xml"
        else:
            self.send_error(404)
            return
        self.owner.events.add("dlna", "get", path=self.path, size=len(body))
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        if length > 256_000:
            self.send_error(413)
            return
        body = self.rfile.read(length)
        self.owner.events.add("dlna", "soap", path=self.path, size=len(body), action=self.headers.get("SOAPAction", ""))
        response = b'<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:OK xmlns:u="urn:libre-lab"/></s:Body></s:Envelope>'
        self.send_response(200)
        self.send_header("Content-Type", "text/xml")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)


class FakeDlnaServer:
    def __init__(self) -> None:
        self.events = EventLog()
        self._server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), _DlnaHandler)
        self._server.owner = self  # type: ignore[attr-defined]
        self.thread = threading.Thread(target=self._server.serve_forever, daemon=True)

    @property
    def port(self) -> int:
        return int(self._server.server_address[1])

    def start(self) -> "FakeDlnaServer":
        self.thread.start()
        return self

    def close(self) -> None:
        self._server.shutdown()
        self._server.server_close()
        self.thread.join(timeout=2)

    def __enter__(self) -> "FakeDlnaServer":
        return self.start()

    def __exit__(self, *_: object) -> None:
        self.close()


class FakeSsdpServer:
    def __init__(self, location: str) -> None:
        self.location = location
        self.events = EventLog()
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind(("127.0.0.1", 0))
        self.sock.settimeout(0.2)
        self.stop = threading.Event()
        self.thread = threading.Thread(target=self._run, daemon=True)

    @property
    def port(self) -> int:
        return int(self.sock.getsockname()[1])

    def _run(self) -> None:
        while not self.stop.is_set():
            try:
                data, addr = self.sock.recvfrom(64_000)
            except socket.timeout:
                continue
            except OSError:
                return
            text = data.decode("utf-8", errors="replace")
            self.events.add("ssdp", "datagram", text=text)
            if "M-SEARCH" not in text.upper():
                continue
            response = (
                "HTTP/1.1 200 OK\r\n"
                "CACHE-CONTROL: max-age=60\r\n"
                "EXT:\r\n"
                f"LOCATION: {self.location}\r\n"
                "SERVER: LibreRemoteLab/1 UPnP/1.1\r\n"
                "ST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n"
                "USN: uuid:libre-lab-renderer-001::urn:schemas-upnp-org:device:MediaRenderer:1\r\n\r\n"
            )
            self.sock.sendto(response.encode(), addr)

    def start(self) -> "FakeSsdpServer":
        self.thread.start()
        return self

    def close(self) -> None:
        self.stop.set()
        self.sock.close()
        self.thread.join(timeout=2)

    def __enter__(self) -> "FakeSsdpServer":
        return self.start()

    def __exit__(self, *_: object) -> None:
        self.close()


def make_test_tls_context(directory: Path, serial: int) -> tuple[ssl.SSLContext, str]:
    openssl = shutil.which("openssl")
    if not openssl:
        raise RuntimeError("openssl is required for WSS lab fixtures")
    key = directory / f"key-{serial}.tmp"
    cert = directory / f"cert-{serial}.tmp"
    subprocess.run(
        [openssl, "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", f"/CN=libre-lab-{serial}", "-keyout", str(key), "-out", str(cert)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    der = ssl.PEM_cert_to_DER_cert(cert.read_text(encoding="utf-8"))
    fingerprint = hashlib.sha256(der).hexdigest()
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(str(cert), str(key))
    return ctx, fingerprint


def websocket_roundtrip(port: int, payload: dict, *, tls: bool = False) -> dict:
    raw = socket.create_connection(("127.0.0.1", port), timeout=3)
    sock: socket.socket
    if tls:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        sock = ctx.wrap_socket(raw, server_hostname="127.0.0.1")
    else:
        sock = raw
    with sock:
        key = base64.b64encode(b"libre-lab-key-123").decode()
        request = (
            "GET / HTTP/1.1\r\n"
            "Host: 127.0.0.1\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        sock.sendall(request.encode())
        response = _recv_until(sock, b"\r\n\r\n")
        if b"101 Switching Protocols" not in response:
            raise AssertionError("websocket handshake failed")
        sock.sendall(ws_client_frame(json.dumps(payload)))
        return json.loads(read_ws_text(sock))


def self_test() -> dict[str, object]:
    results: dict[str, object] = {}
    with FakeWebSocketServer("lg", lg_responder) as lg:
        registered = websocket_roundtrip(lg.port, {"type": "register", "id": "r1"})
        assert registered["type"] == "registered"
        results["lg_ws"] = True

    with FakeWebSocketServer("lg", lg_responder, mode="deny") as lg_denied:
        denied = websocket_roundtrip(lg_denied.port, {"type": "register"})
        assert denied["type"] == "error"
        results["lg_pairing_denied"] = True

    with FakeWebSocketServer("samsung", samsung_responder) as samsung:
        ack = websocket_roundtrip(samsung.port, {"method": "ms.remote.control", "params": {"DataOfCmd": "KEY_MUTE"}})
        assert ack["data"]["key"] == "KEY_MUTE"
        results["samsung_toggle"] = True

    with FakeDlnaServer() as dlna:
        conn = http.client.HTTPConnection("127.0.0.1", dlna.port, timeout=3)
        conn.request("GET", "/device.xml")
        response = conn.getresponse()
        body = response.read()
        assert response.status == 200 and b"uuid:libre-lab-renderer-001" in body
        conn.close()
        results["dlna_description"] = True

        with FakeSsdpServer(f"http://127.0.0.1:{dlna.port}/device.xml") as ssdp:
            client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            client.settimeout(2)
            client.sendto(b"M-SEARCH * HTTP/1.1\r\nST: ssdp:all\r\nMAN: \"ssdp:discover\"\r\nMX: 1\r\n\r\n", ("127.0.0.1", ssdp.port))
            packet, _ = client.recvfrom(64_000)
            client.close()
            assert b"LOCATION:" in packet and b"libre-lab-renderer-001" in packet
            results["ssdp"] = True

    with tempfile.TemporaryDirectory(prefix="libre-lab-") as tmp:
        ctx_a, fp_a = make_test_tls_context(Path(tmp), 1)
        ctx_b, fp_b = make_test_tls_context(Path(tmp), 2)
        assert fp_a != fp_b
        with FakeWebSocketServer("lg", lg_responder, tls_context=ctx_a) as wss:
            registered = websocket_roundtrip(wss.port, {"type": "register"}, tls=True)
            assert registered["type"] == "registered"
        results["lg_wss"] = True
        results["cert_rotation"] = {"first": fp_a, "rotated": fp_b, "different": True}

    return results


def serve_forever() -> None:
    tmp = tempfile.TemporaryDirectory(prefix="libre-lab-")
    ctx, fp = make_test_tls_context(Path(tmp.name), 1)
    dlna = FakeDlnaServer().start()
    ssdp = FakeSsdpServer(f"http://127.0.0.1:{dlna.port}/device.xml").start()
    lg_ws = FakeWebSocketServer("lg", lg_responder).start()
    lg_wss = FakeWebSocketServer("lg", lg_responder, tls_context=ctx).start()
    samsung = FakeWebSocketServer("samsung", samsung_responder).start()
    manifest = {
        "lg_ws": lg_ws.port,
        "lg_wss": lg_wss.port,
        "lg_wss_sha256": fp,
        "samsung_ws": samsung.port,
        "dlna_http": dlna.port,
        "ssdp_udp": ssdp.port,
        "stable_device_id": "libre-lab-renderer-001",
    }
    print(json.dumps(manifest, sort_keys=True), flush=True)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        samsung.close(); lg_wss.close(); lg_ws.close(); ssdp.close(); dlna.close(); tmp.cleanup()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    if args.serve:
        serve_forever()
        return
    result = self_test()
    if args.json:
        print(json.dumps(result, sort_keys=True))
    else:
        for key, value in result.items():
            print(f"PASS {key}: {value}")


if __name__ == "__main__":
    main()
