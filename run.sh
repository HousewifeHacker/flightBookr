#!/bin/bash
set -e
export DEBUG=true
exec gunicorn airline_tickets:app --log-file=- --bind :5000
