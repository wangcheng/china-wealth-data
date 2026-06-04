"""Shared HTTP utilities."""

import ssl

import requests
from requests.adapters import HTTPAdapter


class _LegacyTLSAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        ctx = ssl.create_default_context()
        ctx.options |= ssl.OP_LEGACY_SERVER_CONNECT
        kwargs["ssl_context"] = ctx
        super().init_poolmanager(*args, **kwargs)


def legacy_tls_session() -> requests.Session:
    """Return a requests Session that allows legacy TLS renegotiation.

    Required by some Chinese bank servers (e.g. CCB, CITIC).
    """
    s = requests.Session()
    s.mount("https://", _LegacyTLSAdapter())
    return s
