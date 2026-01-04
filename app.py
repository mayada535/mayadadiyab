from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Data storage file
DATA_FILE = 'data.json'

def load_data():
    """Load messages and orders from file"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {'messages': [], 'orders': []}
    return {'messages': [], 'orders': []}

def save_data(data):
    """Save messages and orders to file"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ============ Contact Form Messages ============

@app.route('/api/messages', methods=['GET'])
def get_messages():
    """Fetch all contact messages"""
    data = load_data()
    return jsonify({'messages': data.get('messages', [])})

@app.route('/api/messages', methods=['POST'])
def save_message():
    """Save a contact form message"""
    payload = request.get_json()
    data = load_data()
    
    message = {
        'id': str(uuid.uuid4()),
        'name': payload.get('name', 'Unknown'),
        'email': payload.get('email', ''),
        'message': payload.get('message', ''),
        'timestamp': datetime.now().isoformat()
    }
    
    data['messages'].append(message)
    save_data(data)
    
    return jsonify({'status': 'Message saved', 'id': message['id']}), 201

@app.route('/api/messages/<id>', methods=['DELETE'])
def delete_message(id):
    """Delete a message"""
    data = load_data()
    data['messages'] = [m for m in data.get('messages', []) if m['id'] != id]
    save_data(data)
    return jsonify({'status': 'Message deleted'})

# ============ Orders ============

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Fetch all orders"""
    data = load_data()
    return jsonify({'orders': data.get('orders', [])})

@app.route('/api/orders', methods=['POST'])
def save_order():
    """Save an order"""
    payload = request.get_json()
    data = load_data()
    
    order = {
        'id': str(uuid.uuid4()),
        'type': payload.get('type', 'Unknown'),
        'pages': payload.get('pages', ''),
        'features': payload.get('features', ''),
        'design': payload.get('design', ''),
        'budget': payload.get('budget', ''),
        'deadline': payload.get('deadline', ''),
        'contact': payload.get('contact', ''),
        'images': payload.get('images', []),
        'notes': payload.get('notes', ''),
        'submittedAt': payload.get('submittedAt', datetime.now().isoformat())
    }
    
    data['orders'].append(order)
    save_data(data)
    
    return jsonify({'status': 'Order saved', 'id': order['id']}), 201

@app.route('/api/orders/<id>', methods=['DELETE'])
def delete_order(id):
    """Delete an order"""
    data = load_data()
    data['orders'] = [o for o in data.get('orders', []) if o['id'] != id]
    save_data(data)
    return jsonify({'status': 'Order deleted'})

# ============ File Upload ============

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Handle file uploads"""
    files = request.files.getlist('files')
    uploaded = []
    
    # Create uploads folder if it doesn't exist
    os.makedirs('uploads', exist_ok=True)
    
    for file in files:
        if file:
            filename = f"{uuid.uuid4()}_{file.filename}"
            filepath = os.path.join('uploads', filename)
            file.save(filepath)
            uploaded.append(f'/uploads/{filename}')
    
    return jsonify({'files': uploaded}), 201

# ============ Summarize Feature ============

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """Summarize text (optional: integrate with OpenAI)"""
    payload = request.get_json()
    text = payload.get('text', '')
    
    # For now, just return the text as-is
    # To integrate OpenAI, uncomment below and add your API key
    
    # import openai
    # openai.api_key = os.getenv('OPENAI_API_KEY')
    # response = openai.ChatCompletion.create(
    #     model="gpt-3.5-turbo",
    #     messages=[{"role": "user", "content": f"Summarize this briefly: {text}"}]
    # )
    # summary = response['choices'][0]['message']['content']
    
    return jsonify({'summary': text})

# ============ Serve Static Files & Admin Dashboard ============

@app.route('/')
def serve_web():
    """Serve the main website"""
    return app.send_static_file('web.html')

@app.route('/admin')
def serve_admin():
    """Serve the admin dashboard"""
    with open('admin.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/uploads/<filename>')
def download_file(filename):
    """Serve uploaded files"""
    return app.send_from_directory('uploads', filename)

if __name__ == '__main__':
    # Bind to 0.0.0.0 so the server is reachable from other devices on the same network
    # Keep debug=True for development; set to False in production
    app.run(debug=True, host='0.0.0.0', port=5000)
