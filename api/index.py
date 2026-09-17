import sys
import os

# Insert project root into sys.path for Vercel Serverless Function module resolution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
