"""
Daily billing reset script.
Run via systemd timer every day at 00:05 UTC.
Resets minutes_used for paid users whose billing_anchor matches today's day of month.
"""
import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)

from database import init_db, reset_due_users

init_db()
reset_emails = reset_due_users()

if reset_emails:
    logger.info("Reset minutes for %d user(s): %s", len(reset_emails), reset_emails)
else:
    logger.info("No billing resets due today.")
