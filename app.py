from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# 기본 라우트
@app.route('/')
def index():
    # 로그인 확인
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('dashboard'))

# 로그인 페이지
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # 실제 구현에서는 데이터베이스와 연동
        employee_id = request.form.get('employee_id')
        password = request.form.get('password')
        
        # 데모 로그인 (실제 구현시 삭제)
        if employee_id == '2024001' and password == 'password':
            session['user_id'] = employee_id
            session['user_name'] = '김전파'
            session['department'] = '전파기술팀'
            return jsonify({'success': True})
        
        return jsonify({'success': False, 'message': '사번 또는 비밀번호가 올바르지 않습니다.'})
    
    return render_template('login.html')

# 로그아웃
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# 대시보드 (동향조사 브리핑 메인)
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # 샘플 데이터
    trends = [
        {
            'id': 1,
            'title': '6G 전파 기술 발전 동향',
            'date': '2024.01.15',
            'duration': '15:42',
            'category': 'technology',
            'thumbnail': '/static/images/thumb1.jpg',
            'description': '차세대 6G 통신 기술의 최신 동향과 발전 방향을 소개합니다.'
        },
        {
            'id': 2,
            'title': '위성 통신 주파수 할당 현황',
            'date': '2024.01.10',
            'duration': '12:30',
            'category': 'satellite',
            'thumbnail': '/static/images/thumb2.jpg',
            'description': '글로벌 위성 통신 주파수 할당 현황과 국내 동향을 분석합니다.'
        },
        {
            'id': 3,
            'title': 'mmWave 기술의 산업 적용',
            'date': '2024.01.05',
            'duration': '18:15',
            'category': 'industry',
            'thumbnail': '/static/images/thumb3.jpg',
            'description': '밀리미터파 기술의 다양한 산업 분야 적용 사례를 살펴봅니다.'
        }
    ]
    
    return render_template('dashboard.html', 
                         user_name=session.get('user_name'),
                         department=session.get('department'),
                         trends=trends)

# 비디오 플레이어 페이지
@app.route('/video/<int:video_id>')
def video_player(video_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # 샘플 비디오 데이터
    video = {
        'id': video_id,
        'title': '6G 전파 기술 발전 동향',
        'date': '2024.01.15',
        'duration': '15:42',
        'character': '귀여운 라마',
        'description': '차세대 6G 통신 기술의 최신 동향과 발전 방향을 소개합니다.',
        'chapters': [
            {'time': '00:00', 'title': '소개'},
            {'time': '02:30', 'title': '6G 기술 개요'},
            {'time': '05:45', 'title': '주요 특징 및 성능'},
            {'time': '09:20', 'title': '글로벌 동향'},
            {'time': '12:15', 'title': '향후 전망'}
        ],
        'resources': [
            {'title': '6G Vision White Paper', 'type': 'pdf'},
            {'title': '기술 사양 문서', 'type': 'doc'},
            {'title': '프레젠테이션 자료', 'type': 'ppt'}
        ]
    }
    
    return render_template('video_player.html',
                         user_name=session.get('user_name'),
                         department=session.get('department'),
                         video=video)

# API 엔드포인트 - 캐릭터 변경
@app.route('/api/change-character', methods=['POST'])
def change_character():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'}), 401
    
    character = request.json.get('character')
    # 실제 구현시 사용자 설정 저장
    session['character'] = character
    
    return jsonify({'success': True, 'character': character})

# API 엔드포인트 - 학습 진행 상황
@app.route('/api/progress', methods=['GET'])
def get_progress():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'}), 401
    
    # 샘플 진행 상황 데이터
    progress = {
        'completed': 12,
        'total': 30,
        'percentage': 40,
        'recent_videos': [
            {'id': 1, 'title': '6G 전파 기술 발전 동향', 'progress': 100},
            {'id': 2, 'title': '위성 통신 주파수 할당 현황', 'progress': 75},
            {'id': 3, 'title': 'mmWave 기술의 산업 적용', 'progress': 30}
        ]
    }
    
    return jsonify({'success': True, 'data': progress})

if __name__ == '__main__':
    app.run(debug=True, port=5000)