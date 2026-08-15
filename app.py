
import os, sqlite3, secrets, shutil, smtplib, hashlib, time, collections
from email.mime.text import MIMEText
from pathlib import Path
from datetime import datetime
from urllib.parse import urlencode, urlparse, parse_qs
import httpx
from fastapi import FastAPI, Request, Form, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

ROOT=Path(__file__).resolve().parent
DB=ROOT/'genplan.db'
UPLOADS=ROOT/'static'/'uploads'
UPLOADS.mkdir(parents=True,exist_ok=True)
app=FastAPI(title='Albatross Genplan')
app.add_middleware(SessionMiddleware, secret_key=os.getenv('SESSION_SECRET','dev-secret-change-me'), same_site='lax', https_only=False)
app.mount('/static',StaticFiles(directory=ROOT/'static'),name='static')
templates=Jinja2Templates(directory=ROOT/'templates')

STATUS_LABELS={'free':'Свободен','busy':'Продан','promotion':'С подрядом','reservation':'Бронь','reserv':'Не продаётся'}
STATUS_COLORS={'free':'#35a45f','busy':'#d84848','promotion':'#2589c7','reservation':'#e1a72f','reserv':'#747c78'}

# --- Rate limiting for login ---
LOGIN_ATTEMPTS = collections.defaultdict(list)  # ip -> [timestamp, ...]
MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 300  # 5 minutes

def is_rate_limited(ip: str) -> bool:
    now = time.time()
    attempts = LOGIN_ATTEMPTS[ip]
    # Remove old attempts
    LOGIN_ATTEMPTS[ip] = [t for t in attempts if now - t < LOCKOUT_SECONDS]
    return len(LOGIN_ATTEMPTS[ip]) >= MAX_ATTEMPTS

def record_failed_attempt(ip: str):
    LOGIN_ATTEMPTS[ip].append(time.time())

# --- Password hashing ---
def hash_password(password: str) -> str:
    salt = os.getenv('SESSION_SECRET', 'fallback-salt')
    return hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()

def verify_password(password: str, stored_hash: str) -> bool:
    return secrets.compare_digest(hash_password(password), stored_hash)

# On first run, if ADMIN_PASSWORD_HASH is not set, use ADMIN_PASSWORD and compare directly
def check_admin_password(password: str) -> bool:
    pw_hash = os.getenv('ADMIN_PASSWORD_HASH')
    if pw_hash:
        return verify_password(password, pw_hash)
    # Fallback to plaintext comparison for backward compatibility
    return secrets.compare_digest(password, os.getenv('ADMIN_PASSWORD', 'change-me'))

def db():
    c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c

def ensure_schema():
    with db() as c:
        c.execute('CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT)')
        defaults={
            'stats_enabled':'1',
            'stats_show_free':'1',
            'stats_show_busy':'1',
            'stats_free_label':'Свободно',
            'stats_busy_label':'Продано'
        }
        for k,v in defaults.items():
            c.execute('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)',(k,v))
        c.commit()

def get_settings():
    with db() as c:
        return {r['key']:r['value'] for r in c.execute('SELECT key,value FROM settings').fetchall()}

ensure_schema()

def admin_ok(request): return bool(request.session.get('admin'))
def require_admin(request):
    if not admin_ok(request): raise HTTPException(401)

def plot_dict(r):
    d=dict(r); d['status_label']=STATUS_LABELS.get(d['status'],d['status']); d['color']=STATUS_COLORS.get(d['status'],'#777'); return d

def fmt_price(n):
    """Format price as '1 234 567 ₽' or return None if zero/empty."""
    if not n:
        return None
    return f"{int(n):,}".replace(",", " ") + " ₽"

@app.get('/',response_class=HTMLResponse)
def index(request:Request):
    return templates.TemplateResponse(request, 'index.html', {'metrika_id':os.getenv('METRIKA_ID',''),'base_url':os.getenv('BASE_URL','')})

@app.get('/api/plots')
def plots():
    with db() as c: rows=c.execute('SELECT * FROM plots').fetchall()
    return [plot_dict(r) for r in rows]

@app.get('/api/stats')
def stats():
    settings=get_settings()
    with db() as c:
        counts={r['status']:r['cnt'] for r in c.execute('SELECT status,COUNT(*) cnt FROM plots WHERE system=0 GROUP BY status').fetchall()}
    return {
        'enabled':settings.get('stats_enabled','1')=='1',
        'show_free':settings.get('stats_show_free','1')=='1',
        'show_busy':settings.get('stats_show_busy','1')=='1',
        'free_label':settings.get('stats_free_label','Свободно'),
        'busy_label':settings.get('stats_busy_label','Продано'),
        'free':counts.get('free',0),
        'busy':counts.get('busy',0)
    }

@app.post('/api/leads')
async def leads(request:Request, plot_id:int=Form(...), name:str=Form(''), phone:str=Form(...), consent:str=Form(...), source_url:str=Form('')):
    if consent!='yes': return JSONResponse({'ok':False,'error':'consent_required'},status_code=422)
    phone=phone.strip(); name=name.strip()
    if len(phone)<7: return JSONResponse({'ok':False,'error':'invalid_phone'},status_code=422)
    ua=request.headers.get('user-agent','')
    with db() as c:
        p=c.execute('SELECT * FROM plots WHERE id=?',(plot_id,)).fetchone()
        if not p: raise HTTPException(404)
        c.execute('INSERT INTO leads(plot_id,name,phone,consent,consent_version,source_url,user_agent) VALUES(?,?,?,?,?,?,?)',(plot_id,name,phone,1,'2026-08-01',source_url,ua)); c.commit()

    # --- Build enhanced notification text ---
    now_str = datetime.now().strftime("%d.%m.%Y, %H:%M")
    area = p["area"]
    price = p["price"]
    alt_price = p["alt_price"] if "alt_price" in p.keys() else 0
    total = price * area if price and area else 0
    status_label = STATUS_LABELS.get(p["status"], p["status"])

    lines = [
        f'📋 Новая заявка — участок №{p["num"]}',
        '',
        f'👤 Имя: {name or "—"}',
        f'📞 Телефон: {phone}',
        '',
        f'📐 Площадь: {area} сот.',
    ]
    if price:
        lines.append(f'💰 Цена за сотку: {fmt_price(price)}')
    if total:
        lines.append(f'💵 Стоимость: {fmt_price(total)}')
    if alt_price:
        lines.append(f'📦 С подрядом: {fmt_price(alt_price)}')
    lines.append(f'📊 Статус: {status_label}')
    lines.append('')
    lines.append(f'🕐 {now_str}')

    if source_url:
        lines.append(f'🔗 {source_url}')
        qs = parse_qs(urlparse(source_url).query)
        utms = [f"{k}: {v[0]}" for k, v in qs.items() if k.startswith('utm_')]
        if utms:
            lines.append('')
            lines.append('📌 UTM:')
            lines.extend(utms)

    text = '\n'.join(lines)

    token=os.getenv('TELEGRAM_BOT_TOKEN'); chat=os.getenv('TELEGRAM_CHAT_ID')
    async with httpx.AsyncClient(timeout=8) as client:
        if token and chat:
            for cid in [c.strip() for c in chat.split(',') if c.strip()]:
                try:
                    resp = await client.post(f'https://api.telegram.org/bot{token}/sendMessage',json={'chat_id':cid,'text':text})
                    if resp.status_code != 200:
                        print(f"Telegram notification error ({cid}): {resp.status_code} {resp.text}")
                except Exception as e:
                    print(f"Telegram notification exception ({cid}): {e}")
        hook=os.getenv('CRM_WEBHOOK_URL')
        if hook:
            try: await client.post(hook,json={'plot_id':plot_id,'plot_num':p['num'],'name':name,'phone':phone,'source_url':source_url,'consent':True})
            except Exception as e:
                print(f"CRM webhook exception: {e}")
    # Email notification
    email_to=os.getenv('EMAIL_TO'); smtp_host=os.getenv('SMTP_HOST'); smtp_user=os.getenv('SMTP_USER'); smtp_pass=os.getenv('SMTP_PASS')
    if email_to and smtp_host and smtp_user and smtp_pass:
        try:
            msg=MIMEText(text,'plain','utf-8')
            msg['Subject']=f'Заявка — участок №{p["num"]}'
            msg['From']=smtp_user
            msg['To']=email_to
            with smtplib.SMTP_SSL(smtp_host, int(os.getenv('SMTP_PORT','465'))) as s:
                s.login(smtp_user, smtp_pass)
                s.send_message(msg)
        except Exception as e:
            print(f"Email notification exception: {e}")
    return {'ok':True}

@app.get('/privacy',response_class=HTMLResponse)
def privacy(request:Request): return templates.TemplateResponse(request, 'privacy.html', {})
@app.get('/consent',response_class=HTMLResponse)
def consent_page(request:Request): return templates.TemplateResponse(request, 'consent.html', {})

from fastapi.responses import PlainTextResponse
@app.get('/robots.txt',response_class=PlainTextResponse)
def robots(): return 'User-agent: *\nDisallow: /admin\nDisallow: /admin/\n'

@app.get('/admin/login',response_class=HTMLResponse)
def login_page(request:Request): return templates.TemplateResponse(request, 'login.html', {'error':''})

@app.post('/admin/login',response_class=HTMLResponse)
def login(request:Request, password:str=Form(...)):
    ip = request.headers.get('x-real-ip', request.client.host if request.client else '0.0.0.0')
    if is_rate_limited(ip):
        return templates.TemplateResponse(request, 'login.html', {'error':'Слишком много попыток. Подождите 5 минут.'}, status_code=429)
    if check_admin_password(password):
        LOGIN_ATTEMPTS.pop(ip, None)  # Clear on success
        request.session['admin']=True
        return RedirectResponse('/admin',303)
    record_failed_attempt(ip)
    remaining = MAX_ATTEMPTS - len(LOGIN_ATTEMPTS.get(ip, []))
    error_msg = 'Неверный пароль' if remaining > 1 else 'Неверный пароль. Осталась 1 попытка.'
    return templates.TemplateResponse(request, 'login.html', {'error': error_msg}, status_code=401)

@app.get('/admin/logout')
def logout(request:Request): request.session.clear(); return RedirectResponse('/admin/login',303)

@app.get('/admin',response_class=HTMLResponse)
def admin(request:Request,q:str='',status:str=''):
    if not admin_ok(request): return RedirectResponse('/admin/login',303)
    sql='SELECT * FROM plots WHERE system=0'; args=[]
    if q: sql+=' AND num LIKE ?'; args.append(f'%{q}%')
    if status: sql+=' AND status=?'; args.append(status)
    sql+=' ORDER BY CAST(num AS INTEGER)'
    with db() as c:
        rows=c.execute(sql,args).fetchall(); leads=c.execute('SELECT leads.*,plots.num plot_num FROM leads LEFT JOIN plots ON plots.id=leads.plot_id ORDER BY leads.id DESC LIMIT 50').fetchall()
    settings=get_settings()
    return templates.TemplateResponse(request, 'admin.html', {'plots':rows,'leads':leads,'labels':STATUS_LABELS,'q':q,'status':status,'settings':settings})


@app.post('/admin/settings')
def update_settings(request:Request, stats_enabled:str=Form('0'), stats_show_free:str=Form('0'), stats_show_busy:str=Form('0'), stats_free_label:str=Form('Свободно'), stats_busy_label:str=Form('Продано')):
    require_admin(request)
    vals={
        'stats_enabled':'1' if stats_enabled=='1' else '0',
        'stats_show_free':'1' if stats_show_free=='1' else '0',
        'stats_show_busy':'1' if stats_show_busy=='1' else '0',
        'stats_free_label':(stats_free_label.strip() or 'Свободно')[:40],
        'stats_busy_label':(stats_busy_label.strip() or 'Продано')[:40]
    }
    with db() as c:
        for k,v in vals.items():
            c.execute('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',(k,v))
        c.commit()
    return RedirectResponse('/admin',303)

@app.post('/admin/plot/{plot_id}')
async def update_plot(request:Request,plot_id:int,area:float=Form(0),price:float=Form(0),alt_price:float=Form(0),status:str=Form(...),description:str=Form(''),image:UploadFile|None=File(None)):
    require_admin(request)
    image_url=None
    if image and image.filename:
        ext=Path(image.filename).suffix.lower()
        if ext not in {'.jpg','.jpeg','.png','.webp'}: raise HTTPException(400,'Неверный формат изображения')
        name=f'{plot_id}_{int(datetime.now().timestamp())}{ext}'
        with open(UPLOADS/name,'wb') as f: shutil.copyfileobj(image.file,f)
        image_url=f'/static/uploads/{name}'
    with db() as c:
        if image_url:
            c.execute('UPDATE plots SET area=?,price=?,alt_price=?,status=?,description=?,image=?,thumb=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',(area,price,alt_price,status,description,image_url,image_url,plot_id))
        else:
            c.execute('UPDATE plots SET area=?,price=?,alt_price=?,status=?,description=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',(area,price,alt_price,status,description,plot_id))
        c.commit()
    return RedirectResponse('/admin',303)
