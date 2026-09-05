#!/usr/bin/env python3
"""One-shot remote deploy for JobOS API + worker. Run locally; requires paramiko."""

import os
import secrets
import sys
from pathlib import Path

try:
    import paramiko
except ImportError:
    import subprocess

    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'paramiko', '-q'])
    import paramiko

ROOT = Path(__file__).resolve().parents[1]
DEPLOY = ROOT / 'deploy' / 'backend'
LOCAL_ENV = ROOT / '.env'

HOST = os.environ.get('JOBOS_SSH_HOST', '2.25.76.201')
USER = os.environ.get('JOBOS_SSH_USER', 'root')
PASSWORD = os.environ.get('JOBOS_SSH_PASSWORD')
if not PASSWORD:
    print('Set JOBOS_SSH_PASSWORD env var', file=sys.stderr)
    sys.exit(1)

REMOTE_ROOT = '/backend'
REMOTE_REPO = f'{REMOTE_ROOT}/Job-Engineer'
REPO_URL = 'https://github.com/saadsrabon/Job-Engineer.git'


def parse_env(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        if k not in data:
            data[k.strip()] = v.strip()
    return data


def build_production_env(local: dict[str, str], pg_password: str, api_port: str) -> str:
    lines = [
        'NODE_ENV=production',
        f'PORT={api_port}',
        f'DATABASE_URL=postgresql://jobos:{pg_password}@127.0.0.1:5433/jobos',
        'REDIS_URL=redis://127.0.0.1:6380',
        f"CLERK_SECRET_KEY={local.get('CLERK_SECRET_KEY', '')}",
        f"CLERK_WEBHOOK_SECRET={local.get('CLERK_WEBHOOK_SECRET', '')}",
        'NEXT_PUBLIC_WEB_URL=https://job-engineer-web.vercel.app',
        'NEXT_PUBLIC_LANDING_URL=https://job-engineer-landing-7mxt.vercel.app',
        f"UPLOAD_DIR={REMOTE_REPO}/uploads",
        f"AI_PROVIDER={local.get('AI_PROVIDER', 'openrouter')}",
        f"AI_API_KEY={local.get('AI_API_KEY', local.get('OPENROUTER_API_KEY', ''))}",
        f"AI_BASE_URL={local.get('AI_BASE_URL', '')}",
        f"AI_DEFAULT_MODEL={local.get('AI_DEFAULT_MODEL', 'auto')}",
        f"AI_MAX_CONCURRENCY={local.get('AI_MAX_CONCURRENCY', '5')}",
        f"AI_MAX_TOKENS_RESUME_PARSER={local.get('AI_MAX_TOKENS_RESUME_PARSER', '4096')}",
        f"AI_MAX_TOKENS_COVER_LETTER={local.get('AI_MAX_TOKENS_COVER_LETTER', '2048')}",
        f"AI_MAX_TOKENS_ATS_SCORER={local.get('AI_MAX_TOKENS_ATS_SCORER', '4096')}",
        f"AI_MAX_TOKENS_JOB_ANALYZER={local.get('AI_MAX_TOKENS_JOB_ANALYZER', '4096')}",
        f"AI_MAX_TOKENS_EMAIL_WRITER={local.get('AI_MAX_TOKENS_EMAIL_WRITER', '2048')}",
        f"OPENROUTER_API_KEY={local.get('OPENROUTER_API_KEY', '')}",
        f"OPENROUTER_RESUME_PARSER_MAX_TOKENS={local.get('OPENROUTER_RESUME_PARSER_MAX_TOKENS', '128')}",
        f"OPENROUTER_RESUME_PARSER_MODEL={local.get('OPENROUTER_RESUME_PARSER_MODEL', '')}",
        f"ADMIN_EMAILS={local.get('ADMIN_EMAILS', '')}",
        '',
    ]
    return '\n'.join(lines)


def run(client: paramiko.SSHClient, cmd: str, check=True) -> str:
    print(f'\n>>> {cmd}')
    _, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print(out.rstrip().encode('ascii', errors='replace').decode('ascii'))
    if err.strip():
        print(err.rstrip().encode('ascii', errors='replace').decode('ascii'), file=sys.stderr)
    return out + err


def sftp_put_dir(sftp: paramiko.SFTPClient, local_dir: Path, remote_dir: str) -> None:
    for path in local_dir.rglob('*'):
        rel = path.relative_to(local_dir).as_posix()
        remote_path = f'{remote_dir}/{rel}'.replace('//', '/')
        if path.is_dir():
            try:
                sftp.mkdir(remote_path)
            except OSError:
                pass
        else:
            sftp.put(str(path), remote_path)


def main() -> None:
    local_env = parse_env(LOCAL_ENV)
    pg_password = secrets.token_urlsafe(24)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f'Connecting to {HOST}...')
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

    run(client, 'mkdir -p /backend')
    inspect = run(
        client,
        'echo "=== PORTS ===" && ss -tln | head -40; echo "=== DOCKER ===" && docker ps --format "table {{.Names}}\\t{{.Ports}}" 2>/dev/null; echo "=== PM2 ===" && pm2 list 2>/dev/null || true',
        check=False,
    )

    api_port = '3011'
    if f':{api_port} ' in inspect or f':{api_port}\n' in inspect:
        api_port = '3012'

    if f'jobos-postgres' not in inspect:
        run(client, f'mkdir -p {REMOTE_REPO}/deploy/backend', check=False)

    run(client, f'if [ -d {REMOTE_REPO} ] && [ ! -d {REMOTE_REPO}/.git ]; then rm -rf {REMOTE_REPO}; fi')

    # Clone or update repo
    run(
        client,
        f'if [ -d {REMOTE_REPO}/.git ]; then cd {REMOTE_REPO} && git pull --ff-only origin main; '
        f'elif [ ! -d {REMOTE_REPO} ] || [ -z "$(ls -A {REMOTE_REPO} 2>/dev/null)" ]; then git clone {REPO_URL} {REMOTE_REPO}; '
        f'else echo "Using existing {REMOTE_REPO} directory"; fi',
        check=False,
    )

    sftp = client.open_sftp()
    try:
        sftp.mkdir(f'{REMOTE_REPO}/deploy', mode=0o755)
    except OSError:
        pass
    try:
        sftp.mkdir(f'{REMOTE_REPO}/deploy/backend', mode=0o755)
    except OSError:
        pass
    sftp_put_dir(sftp, DEPLOY, f'{REMOTE_REPO}/deploy/backend')

    env_content = build_production_env(local_env, pg_password, api_port)
    with sftp.open(f'{REMOTE_REPO}/.env', 'w') as f:
        f.write(env_content)

    run(client, f"chmod +x {REMOTE_REPO}/deploy/backend/install-and-run.sh")
    run(client, f"sed -i 's/\\r$//' {REMOTE_REPO}/deploy/backend/install-and-run.sh")

    # Pass postgres password to docker compose
    run(
        client,
        f'cd {REMOTE_REPO} && POSTGRES_PASSWORD={pg_password} JOBOS_API_PORT={api_port} bash deploy/backend/install-and-run.sh',
        check=False,
    )

    public_ip = run(client, "curl -4 -s ifconfig.me 2>/dev/null || echo 2.25.76.201", check=False).strip().split()[-1]
    api_url = f'http://{public_ip}:{api_port}'

    run(client, f'curl -sf {api_url}/api/v1/health || curl -sf {api_url}/api/docs | head -5', check=False)
    run(client, 'pm2 list', check=False)

    sftp.close()
    client.close()

    print('\n=== DEPLOY COMPLETE ===')
    print(f'NEXT_PUBLIC_API_URL={api_url}')
    print('Set this on Vercel web project and redeploy.')
    print('Ensure firewall allows TCP', api_port, 'or put nginx in front (see deploy/backend/nginx-jobos-api.conf.example).')


if __name__ == '__main__':
    main()
