from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import os
from datetime import datetime
from firecrawl import FirecrawlApp
import requests
from urllib.parse import quote
import time

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Firecrawl API 설정 (실제 사용시 환경변수로 설정)
FIRECRAWL_API_KEY = os.environ.get('FIRECRAWL_API_KEY', 'fc-demo-key')
firecrawl = FirecrawlApp(api_key=FIRECRAWL_API_KEY)

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

# 관리자 대시보드
@app.route('/admin')
def admin_dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # 실제 구현시 관리자 권한 체크
    # if session.get('role') != 'admin':
    #     return redirect(url_for('dashboard'))
    
    return render_template('admin_dashboard.html')

# 크롤링 API 엔드포인트
@app.route('/api/crawl', methods=['POST'])
def crawl_naver_news():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'}), 401
    
    try:
        data = request.json
        keyword = data.get('keyword', 'ai')
        
        # 네이버 뉴스 검색 URL 생성
        encoded_keyword = quote(keyword)
        naver_search_url = f"https://search.naver.com/search.naver?where=news&query={encoded_keyword}"
        
        # Firecrawl을 사용해 네이버 뉴스 검색 페이지 크롤링
        crawl_result = firecrawl.scrape_url(
            url=naver_search_url,
            params={
                'formats': ['markdown', 'extract'],
                'extract': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'articles': {
                                'type': 'array',
                                'items': {
                                    'type': 'object',
                                    'properties': {
                                        'title': {'type': 'string'},
                                        'summary': {'type': 'string'},
                                        'url': {'type': 'string'},
                                        'source': {'type': 'string'},
                                        'date': {'type': 'string'}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )
        
        # 크롤링 결과 처리
        articles = []
        if crawl_result and 'extract' in crawl_result:
            extracted_data = crawl_result['extract']
            if 'articles' in extracted_data:
                articles = extracted_data['articles'][:10]  # 최대 10개만
        
        # 샘플 데이터로 보완 (실제 구현시 제거)
        if not articles:
            articles = [
                {
                    'title': f'{keyword} 관련 뉴스 1: 인공지능 기술 발전 동향',
                    'summary': f'{keyword}과 관련된 최신 기술 동향을 분석한 기사입니다.',
                    'url': 'https://news.naver.com/sample1',
                    'source': '네이버뉴스',
                    'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
                    'category': 'technology'
                },
                {
                    'title': f'{keyword} 관련 뉴스 2: 산업 적용 사례',
                    'summary': f'{keyword} 기술의 실제 산업 적용 사례를 소개합니다.',
                    'url': 'https://news.naver.com/sample2', 
                    'source': '연합뉴스',
                    'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
                    'category': 'industry'
                },
                {
                    'title': f'{keyword} 관련 뉴스 3: 정책 방향',
                    'summary': f'{keyword} 관련 정부 정책 방향과 규제 현황을 다룹니다.',
                    'url': 'https://news.naver.com/sample3',
                    'source': 'KCA뉴스',
                    'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
                    'category': 'policy'
                }
            ]
        
        return jsonify({
            'success': True,
            'data': {
                'keyword': keyword,
                'articles': articles,
                'total_count': len(articles),
                'crawl_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'크롤링 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 크롤링 작업 상태 조회 API
@app.route('/api/crawl-status', methods=['GET'])
def get_crawl_status():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'}), 401
    
    # 샘플 크롤링 작업 상태 데이터
    crawl_jobs = [
        {
            'id': 1,
            'keyword': 'ai',
            'status': 'running',
            'progress': 75,
            'articles_count': 23,
            'start_time': '2024-01-15 14:30:00',
            'estimated_completion': '2024-01-15 14:35:00'
        },
        {
            'id': 2,
            'keyword': '6G',
            'status': 'completed',
            'progress': 100,
            'articles_count': 18,
            'start_time': '2024-01-15 14:00:00',
            'completion_time': '2024-01-15 14:05:00'
        }
    ]
    
    return jsonify({
        'success': True,
        'data': {
            'jobs': crawl_jobs,
            'total_jobs': len(crawl_jobs),
            'running_jobs': len([j for j in crawl_jobs if j['status'] == 'running']),
            'completed_jobs': len([j for j in crawl_jobs if j['status'] == 'completed'])
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)