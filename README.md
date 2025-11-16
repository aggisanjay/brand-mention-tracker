## 🚀 Brand Mention & Reputation Tracker

Real-Time Brand Monitoring Across Reddit, HackerNews, RSS, and Custom Streams — powered by NLP + Socket.io + Spike Detection.

🔥 Overview

This system continuously tracks mentions of your brand from real public sources:

✔ Reddit

✔ HackerNews

✔ TechCrunch RSS

✔ Custom simulators

✔ Any additional sources you add

Every mention flows into your backend, gets analyzed by a Python NLP service, and updates the UI in real-time via Socket.io.


You get:

Live Feed

Sentiment scores

Topic clustering

Spike detection alerts

Beautiful dashboard UI


⚙️ Setup Instructions

1️⃣ Clone the repo

git clone https://github.com/yourusername/brand-reputation-tracker.git

cd brand-reputation-tracker


2️⃣ Backend Setup (Node.js)

cd backend

npm install


Create .env:

PORT=4000

MONGO_URI=mongodb://localhost:27017/mentions

NLP_API=http://localhost:8500


Start server:

npm start

3️⃣ NLP Service (Python)

cd nlp-service

python -m venv venv

Activate the environment

venv\Scripts\activate

Install requirements inside the venv

pip install -r requirements.txt


Download NLTK data:

python -m nltk.downloader stopwords punkt wordnet omw-1.4


Run:

python app.py


4️⃣ Fetcher Service

cd tools

node fetch-real.js

5️⃣ Frontend (React)

cd frontend

npm install

npm run dev


Set .env:

VITE_API=http://localhost:4000

📊 Dashboard Features

✔ Live Feed (real-time)

Streams every new mention instantly.

✔ Sentiment Pie Chart

Powered by Recharts + Lucide icons.

✔ Topic Clusters

Extracts top repeated topics.

✔ Spike Alerts

Based on mention-count acceleration using median baselines.

✔ Recent Mentions

 clean card-based UI.



📸 Screenshots 

<img width="675" height="613" alt="image" src="https://github.com/user-attachments/assets/97939fbc-c418-4c54-bfd0-7e2feba4d210" />


⭐ Contribute

PRs welcome.
If you want more NLP models, embeddings, or advanced clustering — open an issue.

📜 License

MIT License
