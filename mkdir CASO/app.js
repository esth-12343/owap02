/* ========================================
   Security Misconfiguration – JavaScript
   Interactive Labs & Animations
   ======================================== */

'use strict';

/* ══════════════════════════════════════
   PARTICLE BACKGROUND
   ══════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.15;
      const hues = [260, 220, 355, 180];
      this.hue = hues[Math.floor(Math.random() * hues.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${(1 - dist / 100) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════════════════════
   LAB TABS NAVIGATION
   ══════════════════════════════════════ */
document.querySelectorAll('.lab-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.lab-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    const target = this.dataset.tab;
    document.getElementById(target).classList.add('active');
    // Init lab-specific effects
    if (target === 'lab3') initErrorDemo();
    if (target === 'lab4') initHeadersAnalyzer();
  });
});

/* ══════════════════════════════════════
   LAB 1 – DEFAULT CREDENTIALS
   ══════════════════════════════════════ */
const VALID_CREDS = [
  { user: 'admin', pass: 'admin' },
  { user: 'admin', pass: '' },
  { user: 'administrator', pass: '' },
  { user: 'root', pass: 'root' },
  { user: 'user', pass: 'user' },
];

const logBody = document.getElementById('logBody');
const loginResult = document.getElementById('loginResult');
const fakeLogin = document.getElementById('fakeLogin');
const adminPanel = document.getElementById('adminPanel');
let attemptCount = 0;

function addLog(msg, type) {
  if (!logBody.querySelector('.log-hint') || true) {
    const el = document.createElement('div');
    el.className = `log-entry ${type}`;
    el.textContent = msg;
    // Remove hint
    const hint = logBody.querySelector('.log-hint');
    if (hint) hint.remove();
    logBody.appendChild(el);
    logBody.scrollTop = logBody.scrollHeight;
  }
}

function tryLogin(user, pass) {
  if (!user) return;
  attemptCount++;
  const ts = new Date().toLocaleTimeString();
  addLog(`[${ts}] Intentando: ${user || '<vacío>'} / ${pass || '<vacío>'}`, 'attempt');

  const isValid = VALID_CREDS.some(c => c.user === user && c.pass === pass);
  if (isValid) {
    addLog(`[${ts}] ✓ ¡ACCESO CONCEDIDO! Credenciales válidas: ${user}/${pass || '<vacío>'}`, 'success');
    addLog(`[${ts}] Sesión iniciada. Redirigiendo al panel de administración...`, 'info');
    loginResult.textContent = '';
    fakeLogin.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    adminPanel.classList.add('show');
  } else {
    addLog(`[${ts}] ✗ Acceso denegado: credenciales incorrectas`, 'fail');
    loginResult.textContent = '❌ Usuario o contraseña incorrectos';
    loginResult.className = 'login-result fail shake';
    setTimeout(() => loginResult.classList.remove('shake'), 400);
  }
}

document.getElementById('loginAttemptBtn').addEventListener('click', () => {
  const user = document.getElementById('attackUser').value.trim();
  const pass = document.getElementById('attackPass').value;
  tryLogin(user, pass);
});

document.getElementById('attackUser').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('loginAttemptBtn').click();
});
document.getElementById('attackPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('loginAttemptBtn').click();
});

document.querySelectorAll('.cred-pill').forEach(pill => {
  pill.addEventListener('click', function () {
    const user = this.dataset.user;
    const pass = this.dataset.pass;
    document.getElementById('attackUser').value = user;
    document.getElementById('attackPass').value = pass;
    tryLogin(user, pass);
  });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  adminPanel.classList.add('hidden');
  adminPanel.classList.remove('show');
  fakeLogin.classList.remove('hidden');
  document.getElementById('attackUser').value = '';
  document.getElementById('attackPass').value = '';
  loginResult.textContent = '';
  addLog(`[${new Date().toLocaleTimeString()}] Sesión cerrada.`, 'info');
});

/* ══════════════════════════════════════
   LAB 2 – EXPOSED FILES
   ══════════════════════════════════════ */
const FILE_CONTENTS = {
  env: `.env – Variables de Entorno

APP_ENV=production
APP_DEBUG=true
APP_KEY=base64:xK2j8mNpQr5sVwZy3LtFg7HdJkMnOqRu

# Base de datos
DB_CONNECTION=mysql
DB_HOST=192.168.1.100
DB_PORT=3306
DB_DATABASE=produccion_db
DB_USERNAME=root
DB_PASSWORD=SuperSecret_Prod_2024!

# API Keys
STRIPE_KEY=pk_live_51NxJd2CcEqL7...
STRIPE_SECRET=sk_live_4eC39HqLyj...
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG...
AWS_BUCKET=backups-empresa-s3

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=sistema@empresa.com
MAIL_PASSWORD=Empresa2024!

# Tokens
ADMIN_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,

  config: `# config.yml – Configuración de Aplicación

server:
  host: 0.0.0.0
  port: 8080
  debug: true          # ¡PELIGRO! Debug en producción

database:
  host: db.internal.empresa.com
  port: 5432
  name: app_production
  user: app_admin
  password: "db_pass_2024"    # ¡Hardcoded!
  pool_size: 20

redis:
  host: redis.internal.empresa.com
  port: 6379
  password: "redis_secret"

jwt:
  secret: "jwt_super_secret_key_2024"
  expiry: 86400

admin:
  username: admin
  password: admin123   # ¡Credencial por defecto!`,

  sql: `-- backup_db.sql – Dump de Base de Datos de Producción
-- Generado: 2024-01-15 03:00:00

CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  rol ENUM('admin','user'),
  created_at TIMESTAMP
);

INSERT INTO usuarios VALUES
(1, 'ceo@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy8', 'admin', '2023-01-01'),
(2, 'admin@empresa.com', '$2b$10$YzS8...', 'admin', '2023-01-02'),
(3, 'juan.perez@empresa.com', '$2b$10$Ab3...', 'user', '2023-06-15');

CREATE TABLE tarjetas_credito (
  id INT, usuario_id INT,
  numero VARCHAR(20),
  cvv VARCHAR(4),
  expiry VARCHAR(7)
);

INSERT INTO tarjetas_credito VALUES
(1, 3, '4532015112830366', '123', '08/2025');

-- 15,432 registros más...`,

  git: `/.git/ – Repositorio Git Expuesto

HEAD          → refs/heads/main
config        → [remote "origin"] url = https://github.com/empresa/app-privada.git
COMMIT_EDITMSG → "fix: remove hardcoded credentials (oops)"
index         → [archivo binario - índice del repo]
logs/HEAD     → commits del repositorio
objects/      → todos los objetos del repo

⚠️  Con /.git expuesto, un atacante puede:
  → git clone http://victima.com/.git repo-robado
  → Obtener TODO el código fuente
  → Ver historial de commits (incluyendo secretos borrados)
  → Recuperar contraseñas hardcodeadas en commits anteriores

Herramienta: GitHack, git-dumper`,

  log: `[2024-01-15 08:23:41] ERROR app.controllers.UserController:143
Uncaught exception: PDOException: SQLSTATE[42000]: Syntax error
Query: SELECT * FROM usuarios WHERE id = '99999'''
File: /var/www/html/app/controllers/UserController.php:143
Stack trace:
  #0 /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Connection.php(703)
  #1 /var/www/html/app/Http/Controllers/UserController.php(143)

[2024-01-15 10:45:12] DEBUG AdminController.php:89
Admin login attempt: admin@empresa.com | IP: 45.33.32.156
JWT_SECRET: jwt_super_secret_2024_produccion

[2024-01-15 11:02:33] INFO System
DB Connection: mysql://root:SuperSecret_Prod_2024!@192.168.1.100:3306/produccion_db

Servidor: Apache/2.4.41 · PHP/7.4.3 · Laravel/8.0.0
OS: Ubuntu 20.04 · /var/www/html/`
};

document.querySelectorAll('.file-item.clickable').forEach(item => {
  item.addEventListener('click', function () {
    const type = this.dataset.type;
    const path = this.dataset.path;
    const content = FILE_CONTENTS[type];
    if (!content) return;

    document.getElementById('fileUrl').textContent = `🔓 http://victima.com${path}`;
    document.getElementById('fileContentTitle').textContent = path;
    document.getElementById('fileContentBody').textContent = content;
    document.getElementById('fileExplorer').classList.add('hidden');
    const fc = document.getElementById('fileContent');
    fc.classList.remove('hidden');
    fc.classList.add('show');
  });
});

document.getElementById('backBtn').addEventListener('click', () => {
  document.getElementById('fileUrl').textContent = '🔓 http://victima.com/';
  document.getElementById('fileContent').classList.add('hidden');
  document.getElementById('fileContent').classList.remove('show');
  document.getElementById('fileExplorer').classList.remove('hidden');
});

/* ══════════════════════════════════════
   LAB 3 – VERBOSE ERROR MESSAGES
   ══════════════════════════════════════ */
const ERROR_TEMPLATES = {
  django: `<span style="color:#ff6b6b;font-weight:700;">EnvironmentError at /user/</span>
<span style="color:#ff8888;">DoesNotExist: User matching query does not exist.</span>

<span style="color:#8b9ab5;">Request Method: GET</span>
<span style="color:#8b9ab5;">Request URL:    http://192.168.1.50:8000/user/?id=99999</span>
<span style="color:#8b9ab5;">Django Version: 3.2.4</span>
<span style="color:#8b9ab5;">Python Version: 3.9.7</span>
<span style="color:#8b9ab5;">Installed Apps:</span>
<span style="color:#ffd700;">  django.contrib.admin, django.contrib.auth, 'myapp', 'debug_toolbar'</span>

<span style="color:#06b6d4;">Traceback:</span>
<span style="color:#4a5568;">File "/home/ubuntu/myproject/venv/lib/python3.9/site-packages/django/db/models/query.py"</span>
<span style="color:#4a5568;">  line 435, in get raise self.model.DoesNotExist</span>
<span style="color:#4a5568;">File "/home/ubuntu/myproject/myapp/views.py", line 28, in user_detail</span>
<span style="color:#ff8888;">  user = User.objects.get(id=request.GET['id'])</span>

<span style="color:#a855f7;">Settings:</span>
<span style="color:#ff4444;">  SECRET_KEY = 'django-insecure-xk2j8mNpQr...'</span>
<span style="color:#ff4444;">  DEBUG = True</span>
<span style="color:#ff4444;">  DATABASES HOST = '192.168.1.100'</span>
<span style="color:#ff4444;">  DATABASES PASSWORD = 'SuperSecret_Prod_2024!'</span>

<span style="color:#8b9ab5;">Switch to: <a style="color:#4a9eff;">interactive debugger</a> (ejecuta código Python en el servidor)</span>`,

  php: `<span style="color:#ff6b6b;font-weight:700;">Fatal error</span>: Uncaught PDOException: SQLSTATE[42000]:
Syntax error or access violation: You have an error in your SQL syntax;
check the manual for MySQL server version 8.0.27 for the right syntax
Query: SELECT * FROM <span style="color:#ff4444;">usuarios</span> WHERE id = '99999'''

<span style="color:#8b9ab5;">Stack trace:</span>
<span style="color:#4a5568;">#0 /var/www/html/includes/db.php(45): PDO->query()</span>
<span style="color:#4a5568;">#1 /var/www/html/controllers/UserController.php(143): Database->query()</span>
<span style="color:#4a5568;">#2 /var/www/html/index.php(12): UserController->getUser()</span>

<span style="color:#ffd700;">PHP Version:</span> <span style="color:#ff8888;">7.4.3 (EOL - Sin soporte desde Nov 2022)</span>
<span style="color:#ffd700;">Server:</span> Apache/2.4.41 Ubuntu
<span style="color:#ffd700;">Path:</span> <span style="color:#ff4444;">/var/www/html/controllers/UserController.php on line 143</span>

<span style="color:#8b9ab5;">Throw in</span> <span style="color:#ff4444;">/var/www/html/includes/db.php on line 45</span>`,

  java: `<span style="color:#ff6b6b;font-weight:700;">HTTP Status 500 – Internal Server Error</span>

<span style="color:#ffd700;">Type</span> Exception Report
<span style="color:#ffd700;">Description</span> The server encountered an unexpected condition that prevented it from fulfilling the request.

<span style="color:#06b6d4;">java.lang.NullPointerException</span>: Cannot invoke method getUser(java.lang.Long)
  <span style="color:#4a5568;">at com.empresa.app.service.UserService.getUserById(UserService.java:89)</span>
  <span style="color:#4a5568;">at com.empresa.app.controller.UserController.getUser(UserController.java:52)</span>
  <span style="color:#4a5568;">at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)</span>
  <span style="color:#4a5568;">at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:897)</span>

<span style="color:#ffd700;">Server Info:</span>
<span style="color:#ff8888;">  Spring Boot 2.5.4 · Tomcat/9.0.52 · Java 11.0.11</span>
<span style="color:#ff4444;">  DB URL: jdbc:mysql://db-internal:3306/produccion</span>
<span style="color:#ff4444;">  User: root · Pass: *** (intentar: 'admin', 'root', 'password')</span>`,

  secure: `<span style="color:#22c55e;font-weight:700;">✅ Error 404 – Recurso no encontrado</span>

<span style="color:#8b9ab5;">El recurso solicitado no existe.
Si el problema persiste, contacte al soporte técnico.</span>

<span style="color:#4a5568;">Error ID: #a3f8c2e1</span>

<span style="color:#22c55e;">──────────────────────────────────────
Esta es la respuesta correcta:
• Sin stack traces visibles
• Sin rutas del servidor
• Sin versiones de software
• Sin información de la base de datos
• Solo un ID de error para correlación interna
──────────────────────────────────────</span>`
};

function initErrorDemo() {
  const output = document.getElementById('errorOutput');
  if (!output) return;
  output.innerHTML = ERROR_TEMPLATES['django'];
}

document.querySelectorAll('.err-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.err-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const output = document.getElementById('errorOutput');
    output.innerHTML = ERROR_TEMPLATES[this.dataset.err];
    output.style.animation = 'none';
    output.offsetHeight;
    output.style.animation = 'panelIn 0.3s ease';
  });
});

// Init error demo on load if lab3 is active
if (document.getElementById('lab3').classList.contains('active')) {
  initErrorDemo();
}

/* ══════════════════════════════════════
   LAB 4 – HTTP SECURITY HEADERS
   ══════════════════════════════════════ */
const HEADER_CONFIGS = {
  vulnerable: [
    { name: 'Content-Security-Policy', status: 'fail', grade: 'F', desc: 'Ausente. Permite ejecución de scripts arbitrarios (XSS).', icon: '✗' },
    { name: 'Strict-Transport-Security', status: 'fail', grade: 'F', desc: 'Ausente. No fuerza HTTPS, permite downgrade attacks.', icon: '✗' },
    { name: 'X-Frame-Options', status: 'fail', grade: 'F', desc: 'Ausente. Vulnerable a Clickjacking.', icon: '✗' },
    { name: 'X-Content-Type-Options', status: 'fail', grade: 'F', desc: 'Ausente. Permite MIME sniffing.', icon: '✗' },
    { name: 'Permissions-Policy', status: 'fail', grade: 'F', desc: 'Ausente. Sin restricciones de APIs del navegador.', icon: '✗' },
    { name: 'Referrer-Policy', status: 'fail', grade: 'F', desc: 'Ausente. URL completa enviada como referrer.', icon: '✗' },
    { name: 'Server', status: 'warn', grade: '⚠', desc: 'Presente: "Apache/2.4.41 (Ubuntu)" — Revela versión exacta.', icon: '⚠' },
    { name: 'X-Powered-By', status: 'warn', grade: '⚠', desc: 'Presente: "PHP/7.4.3" — Framework y versión expuestos.', icon: '⚠' },
  ],
  secure: [
    { name: 'Content-Security-Policy', status: 'pass', grade: 'A+', desc: "default-src 'self'; script-src 'self' 'nonce-xxx'; block-all-mixed-content", icon: '✓' },
    { name: 'Strict-Transport-Security', status: 'pass', grade: 'A+', desc: 'max-age=31536000; includeSubDomains; preload', icon: '✓' },
    { name: 'X-Frame-Options', status: 'pass', grade: 'A', desc: 'DENY — No puede ser embebido en iframes', icon: '✓' },
    { name: 'X-Content-Type-Options', status: 'pass', grade: 'A', desc: 'nosniff — Previene MIME type confusion', icon: '✓' },
    { name: 'Permissions-Policy', status: 'pass', grade: 'A', desc: 'camera=(), microphone=(), geolocation=()', icon: '✓' },
    { name: 'Referrer-Policy', status: 'pass', grade: 'A', desc: 'strict-origin-when-cross-origin', icon: '✓' },
    { name: 'Server', status: 'pass', grade: 'A', desc: 'Ausente (ocultado) — No revela información del servidor', icon: '✓' },
    { name: 'X-Powered-By', status: 'pass', grade: 'A', desc: 'Ausente (eliminado) — Framework ocultado', icon: '✓' },
  ]
};

function initHeadersAnalyzer() {
  const result = document.getElementById('headersResult');
  if (result.children.length === 0) renderHeaders('vulnerable');
}

function renderHeaders(type) {
  const result = document.getElementById('headersResult');
  result.innerHTML = '';
  HEADER_CONFIGS[type].forEach((h, i) => {
    const row = document.createElement('div');
    row.className = `header-row ${h.status}`;
    row.style.animationDelay = `${i * 0.05}s`;
    row.innerHTML = `
      <span class="header-status">${h.icon === '✓' ? '✅' : h.icon === '✗' ? '❌' : '⚠️'}</span>
      <div class="header-info">
        <div class="header-name ${h.status}">${h.name}</div>
        <div class="header-desc">${h.desc}</div>
      </div>
      <span class="header-grade" style="color:${h.status === 'pass' ? 'var(--green)' : h.status === 'fail' ? 'var(--red)' : 'var(--orange)'}">${h.grade}</span>
    `;
    result.appendChild(row);
  });
}

document.getElementById('analyzeBtn').addEventListener('click', function () {
  const url = document.getElementById('urlInput').value;
  const isSecure = url.includes('secure') || url.includes('https') || !url.includes('vulnerable');
  const type = isSecure ? 'secure' : 'vulnerable';
  this.textContent = 'Analizando...';
  this.disabled = true;
  setTimeout(() => {
    renderHeaders(type);
    this.textContent = 'Analizar';
    this.disabled = false;
  }, 800);
});

// Preset URLs
document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('analyzeBtn').click();
});

/* ══════════════════════════════════════
   LAB 5 – DEBUG / RCE CONSOLE
   ══════════════════════════════════════ */
const RCE_RESPONSES = {
  'import os; os.system("whoami")': 'www-data\n0',
  'import os; os.system("id")': 'uid=33(www-data) gid=33(www-data) groups=33(www-data)\n0',
  'import os; os.system("cat /etc/passwd")': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n...',
  'import os; os.listdir(".")': "['manage.py', 'requirements.txt', '.env', 'db.sqlite3', 'myapp', 'settings']",
  'import os; os.system("ls -la /")': 'total 68\ndrwxr-xr-x  21 root root 4096 Jan 15 08:00 .\ndrwxr-xr-x  21 root root 4096 Jan 15 08:00 ..\ndrwxr-xr-x   2 root root 4096 Jan 15 08:00 etc\ndrwxr-xr-x  14 root root 4096 Jan 15 08:00 var\n...',
  'open(".env").read()': 'SECRET_KEY=django-insecure-xk2j8mNp...\nDB_PASSWORD=SuperSecret_Prod_2024!\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI...\n',
  'import subprocess; subprocess.check_output(["uname","-a"]).decode()': 'Linux prod-server-01 5.15.0-88-generic #98-Ubuntu SMP Mon Oct 2 15:18:56 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux',
};

const DEFAULT_RCE = '¡Comando ejecutado en el servidor! (simulación educativa)';

document.getElementById('consoleRun').addEventListener('click', executeConsole);
document.getElementById('consoleInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') executeConsole();
});

function executeConsole() {
  const input = document.getElementById('consoleInput');
  const history = document.getElementById('consoleHistory');
  const cmd = input.value.trim();
  if (!cmd) return;

  const cmdLine = document.createElement('div');
  cmdLine.className = 'console-line command';
  cmdLine.textContent = `>>> ${cmd}`;
  history.appendChild(cmdLine);

  const result = document.createElement('div');
  result.className = 'console-line result';
  const response = RCE_RESPONSES[cmd] || DEFAULT_RCE;
  result.textContent = response;
  history.appendChild(result);

  input.value = '';
  history.scrollTop = history.scrollHeight;
}

// Suggestions on placeholder cycle
const suggestions = [
  'import os; os.system("whoami")',
  'open(".env").read()',
  'import os; os.listdir(".")',
  'import subprocess; subprocess.check_output(["uname","-a"]).decode()',
];
let suggIdx = 0;
setInterval(() => {
  const ci = document.getElementById('consoleInput');
  if (ci && document.activeElement !== ci) {
    ci.placeholder = suggestions[suggIdx % suggestions.length];
    suggIdx++;
  }
}, 3000);

/* ══════════════════════════════════════
   SECURITY CHECKLIST
   ══════════════════════════════════════ */
const CHECKLIST_DATA = {
  checkAuth: [
    'Cambiar todas las credenciales por defecto',
    'Implementar política de contraseñas fuertes',
    'Habilitar autenticación multifactor (MFA)',
    'Deshabilitar cuentas de servicio innecesarias',
  ],
  checkServer: [
    'Desactivar DEBUG/modo desarrollo en producción',
    'Desactivar listado de directorios en el servidor web',
    'Eliminar o deshabilitar servicios no utilizados',
    'Mantener software y dependencias actualizadas',
  ],
  checkHeaders: [
    'Configurar Content-Security-Policy (CSP)',
    'Habilitar Strict-Transport-Security (HSTS)',
    'Agregar X-Frame-Options: DENY',
    'Configurar X-Content-Type-Options: nosniff',
    'Ocultar headers Server y X-Powered-By',
  ],
  checkFiles: [
    'Excluir .env y archivos de configuración del servidor web',
    'Proteger o eliminar archivos .git del acceso público',
    'No almacenar backups dentro del directorio web',
    'Usar variables de entorno para secretos (no hardcodear)',
  ],
  checkMonitor: [
    'Implementar logging de accesos y errores',
    'Monitorizar intentos de acceso fallidos',
    'Configurar alertas para anomalías de seguridad',
    'Revisar configuración de seguridad periódicamente',
    'Realizar pruebas de penetración regulares',
  ],
};

let checklistTotal = 0;
let checklistChecked = 0;

function buildChecklist() {
  checklistTotal = 0;
  Object.entries(CHECKLIST_DATA).forEach(([catId, items]) => {
    const container = document.getElementById(catId);
    if (!container) return;
    items.forEach(item => {
      checklistTotal++;
      const el = document.createElement('div');
      el.className = 'check-item';
      el.innerHTML = `
        <div class="check-box">
          <span class="check-mark">✓</span>
        </div>
        <span class="check-text">${item}</span>
      `;
      el.addEventListener('click', function () {
        const wasChecked = this.classList.contains('checked');
        this.classList.toggle('checked');
        checklistChecked += wasChecked ? -1 : 1;
        updateProgress();
      });
      container.appendChild(el);
    });
  });
  updateProgress();
}

function updateProgress() {
  const pct = Math.round((checklistChecked / checklistTotal) * 100);
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressText').textContent = `${checklistChecked} / ${checklistTotal} controles implementados`;
  document.getElementById('progressScore').textContent = `Seguridad: ${pct}%`;

  const resultEl = document.getElementById('checklistResult');
  let level, msg;
  if (pct === 0) {
    level = 0; msg = '🚨 Crítico: Tu aplicación es altamente vulnerable. ¡Implementa controles de seguridad de inmediato!';
  } else if (pct < 40) {
    level = 0; msg = `🚨 Alto Riesgo (${pct}%): Múltiples vectores de ataque expuestos. Prioriza los controles de autenticación y configuración.`;
  } else if (pct < 70) {
    level = 1; msg = `⚠️ Riesgo Moderado (${pct}%): Buena base, pero existen brechas importantes que deben ser cerradas.`;
  } else if (pct < 100) {
    level = 2; msg = `🟡 Casi Seguro (${pct}%): Muy buena postura de seguridad. Completa los controles restantes para máxima protección.`;
  } else {
    level = 3; msg = '✅ ¡Excelente! Todos los controles implementados. Tu aplicación tiene una configuración de seguridad robusta.';
  }
  resultEl.className = `checklist-result level-${level}`;
  resultEl.textContent = msg;
}

document.getElementById('resetChecklist').addEventListener('click', () => {
  document.querySelectorAll('.check-item').forEach(el => el.classList.remove('checked'));
  checklistChecked = 0;
  updateProgress();
});

buildChecklist();

/* ══════════════════════════════════════
   INIT ERROR DEMO ON FIRST LOAD
   ══════════════════════════════════════ */
// Lazy init for lab3
document.getElementById('tab-lab3').addEventListener('click', () => {
  setTimeout(initErrorDemo, 100);
});
document.getElementById('tab-lab4').addEventListener('click', () => {
  setTimeout(initHeadersAnalyzer, 100);
});

/* ══════════════════════════════════════
   SCROLL ANIMATIONS
   ══════════════════════════════════════ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stat-card, .compare-panel').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

/* ══════════════════════════════════════
   HEADER SCROLL EFFECT
   ══════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (window.scrollY > 50) {
    header.style.borderBottomColor = 'rgba(255,255,255,0.12)';
  } else {
    header.style.borderBottomColor = 'rgba(255,255,255,0.08)';
  }
});
