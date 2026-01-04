from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
import datetime
import smtplib
from email.message import EmailMessage
from werkzeug.utils import secure_filename
from flask import send_from_directory

try:
    import openai
except Exception:
    openai = None

load_dotenv()

APP = Flask(__name__)
CORS(APP)

ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'orders.json')
MAYADA_EMAIL = os.getenv('MAYADA_EMAIL', 'mayada45@hotmail.com')
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_order(payload: dict):
    payload['receivedAt'] = datetime.datetime.utcnow().isoformat() + 'Z'
    try:
        if os.path.exists(ORDERS_FILE):
            with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = []
    except Exception:
        data = []
    data.append(payload)
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def send_email(subject: str, body: str, to_addr: str = MAYADA_EMAIL):
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    from_addr = os.getenv('SMTP_FROM', smtp_user or 'no-reply@example.com')
    if not smtp_host or not smtp_user or not smtp_pass:
        return False
    msg = EmailMessage()
    msg['From'] = from_addr
    msg['To'] = to_addr
    msg['Subject'] = subject
    msg.set_content(body)
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as s:
            s.starttls()
            s.login(smtp_user, smtp_pass)
            s.send_message(msg)
        return True
    except Exception:
        return False


@APP.route('/api/summarize', methods=['POST'])
def summarize():
    data = request.get_json() or {}
    text = data.get('text', '')
    # If OpenAI is configured, use it to produce a short summary
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key and openai:
        try:
            openai.api_key = api_key
            prompt = f"Summarize the following user description into a concise list of features and pages (2-4 sentences):\n\n{text}"
            resp = openai.Completion.create(
                engine=os.getenv('OPENAI_ENGINE', 'text-davinci-003'),
                prompt=prompt,
                max_tokens=150,
                temperature=0.6,
            )
            summary = resp.choices[0].text.strip()
            return jsonify({'summary': summary})
        except Exception as e:
            return jsonify({'summary': text[:300], 'warning': str(e)})
    # Fallback: simple heuristic summary
    summary = ' / '.join([s.strip() for s in text.split('.') if s.strip()][:3])
    if not summary:
        summary = text[:300]
    return jsonify({'summary': summary})


@APP.route('/api/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'files': []}), 400
    files = request.files.getlist('files')
    urls = []
    for f in files:
        if f.filename == '':
            continue
        filename = secure_filename(f.filename)
        # ensure unique
        base, ext = os.path.splitext(filename)
        filename = f"{base}-{int(datetime.datetime.utcnow().timestamp())}{ext}"
        path = os.path.join(UPLOAD_DIR, filename)
        f.save(path)
        urls.append(f"/uploads/{filename}")
    return jsonify({'files': urls})


@APP.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)


@APP.route('/api/orders', methods=['POST'])
def orders():
    payload = request.get_json() or {}
    if not payload:
        return jsonify({'error': 'no payload'}), 400
    save_order(payload)
    # try to send email if SMTP configured
    subject = f"New order: {payload.get('type', 'Unknown')}"
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    emailed = send_email(subject, body)
    return jsonify({'ok': True, 'emailed': emailed})


if __name__ == '__main__':
    APP.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')))
