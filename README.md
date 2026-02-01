# GitHub Webhook Receiver

## Overview
This project captures GitHub repository events using webhooks and displays recent activity in real time. 
It listens to Push, Pull Request, and Merge events, stores clean data in MongoDB, and shows updates on a simple UI that refreshes every 15 seconds.

## Tech Stack
- Backend: Python, Flask
- Database: MongoDB Atlas
- Frontend: HTML, CSS, JavaScript
- Tools: GitHub Webhooks, ngrok

## Application Flow
1. GitHub triggers events (Push, Pull Request, Merge).
2. Webhook sends event data to Flask endpoint.
3. Flask extracts required fields and stores them in MongoDB.
4. UI polls the backend every 15 seconds and displays the latest activity.

## How to Run Locally
1. Clone the repository.
2. Create a `.env` file with MongoDB credentials.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
