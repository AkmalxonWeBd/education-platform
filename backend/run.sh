#!/bin/bash

# Backend o'rnatish va ishga tushirish

echo "Backend dependencies o'rnatilmoqda..."
pip install -r requirements.txt

echo "MongoDB connection tekshirilmoqda..."
python -c "from database import connect_db; import asyncio; asyncio.run(connect_db())"

echo "Backend ishga tushmoqda..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
