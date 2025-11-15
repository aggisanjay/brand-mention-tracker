import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np
from dotenv import load_dotenv

# Optional Gemini
try:
    import google.generativeai as genai
except Exception:
    genai = None

load_dotenv()
PORT = int(os.getenv('PORT', 8500))
GEMINI_KEY = os.getenv('GEMINI_KEY')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'models/embedding-001')
EMBEDDING_BATCH = int(os.getenv('EMBEDDING_BATCH', 32))

if GEMINI_KEY and genai:
    genai.configure(api_key=GEMINI_KEY)

# Ensure NLTK data
nltk_packages = ['stopwords','punkt','wordnet','omw-1.4']
for pkg in nltk_packages:
    try:
        nltk.data.find(f'tokenizers/{pkg}')
    except LookupError:
        nltk.download(pkg)

from nltk.corpus import stopwords
stop_words = set(stopwords.words('english'))

app = Flask(__name__)
CORS(app)
analyzer = SentimentIntensityAnalyzer()

def label_from_score(score):
    if score >= 0.3:
        return 'positive'
    if score <= -0.3:
        return 'negative'
    return 'neutral'

def simple_topics(text, top_n=3):
    tokens = nltk.word_tokenize(text.lower())
    tokens = [t for t in tokens if t.isalpha() and t not in stop_words and len(t) > 3]
    freq = {}
    for t in tokens:
        freq[t] = freq.get(t,0) + 1
    sorted_tokens = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [t for t,_ in sorted_tokens[:top_n]]

def get_gemini_embedding(text: str):
    if not GEMINI_KEY or not genai:
        raise RuntimeError("Gemini not configured or client not installed")
    # embed_content returns embedding in `embedding`
    result = genai.embed_content(model=GEMINI_MODEL, content=text)
    # result may be dict-like; attempt to read embedding
    embedding = result.get('embedding') or result.get('data', [{}])[0].get('embedding') or []
    return embedding

@app.route('/analyze', methods=['POST'])
def analyze():
    payload = request.get_json(force=True)
    text = payload.get('text','') or ''
    doc_id = payload.get('id', None)

    vs = analyzer.polarity_scores(text)
    raw = vs.get('compound', 0.0)
    label = label_from_score(raw)

    topics = simple_topics(text, top_n=3)

    embedding = []
    if GEMINI_KEY and genai:
        try:
            embedding = get_gemini_embedding(text)
        except Exception as e:
            print('Gemini embedding error:', e)
            embedding = []

    return jsonify({
        'id': doc_id,
        'sentiment': {'score': raw, 'label': label, 'meta': vs},
        'topics': topics,
        'embedding': embedding,
        'meta': {'source': 'vader+simple' + ('+gemini' if embedding else '')}
    })

@app.route('/batch_cluster', methods=['POST'])
def batch_cluster():
    payload = request.get_json(force=True)
    documents = payload.get('documents', [])
    n_topics = int(payload.get('n_topics', 5))
    if not documents:
        return jsonify({'error': 'no documents'}), 400

    ids = [d.get('id', str(i)) for i,d in enumerate(documents)]
    texts = [d.get('text','') for d in documents]

    use_embeddings = bool(GEMINI_KEY and genai)
    X = None
    if use_embeddings:
        try:
            embeddings = []
            for i in range(0, len(texts), EMBEDDING_BATCH):
                batch = texts[i:i+EMBEDDING_BATCH]
                for t in batch:
                    vec = get_gemini_embedding(t)
                    embeddings.append(vec)
            X = np.array(embeddings)
        except Exception as e:
            print('Gemini embeddings failed, falling back to TF-IDF', e)
            use_embeddings = False

    if not use_embeddings:
        vectorizer = TfidfVectorizer(max_features=2000, stop_words='english', ngram_range=(1,2))
        X = vectorizer.fit_transform(texts).toarray()

    n_clusters = min(n_topics, max(1, len(texts)))
    km = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
    km.fit(X)
    labels = km.labels_

    top_terms = []
    if not use_embeddings:
        terms = np.array(vectorizer.get_feature_names_out())
        centroids = km.cluster_centers_
        for i in range(n_clusters):
            top_idx = centroids[i].argsort()[::-1][:8]
            top_terms.append(list(terms[top_idx]))
    else:
        top_terms = [[] for _ in range(n_clusters)]

    assignments = [{'id': ids[i], 'cluster': int(labels[i])} for i in range(len(ids))]
    return jsonify({'n_topics': n_clusters, 'assignments': assignments, 'top_terms': top_terms})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
