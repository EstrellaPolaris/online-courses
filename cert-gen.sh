#!/bin/bash

CERT_DIR="./certs"
DOMAIN="lms.local"

mkdir -p "$CERT_DIR"

echo "🔐 Генерирую самоподписанный TLS-сертификат для $DOMAIN..."

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "/C=RU/ST=Local/L=Local/O=LMS Dev/CN=$DOMAIN"

echo "✅ Сертификаты сгенерированы:"
echo "  🔑 $CERT_DIR/server.key"
echo "  📄 $CERT_DIR/server.crt"
