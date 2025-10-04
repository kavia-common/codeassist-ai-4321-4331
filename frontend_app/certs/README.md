# Self-Signed TLS Certificates

This folder contains development-only self-signed TLS materials:

- cert.pem — X.509 certificate
- key.pem — RSA private key (unencrypted) for local development

How these were created (idempotent script used by the agent):
- Directory ensured to exist: `mkdir -p certs`
- Existing files, if present, were backed up with a timestamp suffix: `*.bak`
- New cert/key generated with OpenSSL:
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certs/key.pem -out certs/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Org/OU=Dev/CN=localhost"

Notes:
- Intended for local development or previews only. Do not use in production.
- If you need to regenerate, rerun the same commands; existing files will be backed up automatically.
- Typical usage: configure your dev server or reverse proxy to use certs/key.pem and certs/cert.pem.
