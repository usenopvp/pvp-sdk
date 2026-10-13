"""Launch a token from Python through the pvp CLI (npm install -g @usenopvp/sdk).

python examples/python/launch.py "My Token" MYTKN https://example.com/image.png
"""
import json
import subprocess
import sys


def pvp(*args):
    r = subprocess.run(["pvp", *args, "--json"], capture_output=True, text=True, shell=sys.platform == "win32")
    out = json.loads(r.stdout or "{}")
    if r.returncode != 0:
        raise RuntimeError(f"{out.get('code')}: {out.get('error', r.stderr)}")
    return out


name, symbol, image = sys.argv[1:4]
status = pvp("check-name", name)
if not status["available"]:
    sys.exit(f'"{name}" is not available: {status["reason"]}')
# --yes confirms transactions on mainnet (the CLI's default network); set PVP_NETWORK=devnet to test for free.
launched = pvp("launch", "--name", name, "--symbol", symbol, "--image", image, "--yes")
print("launched", launched["mint"])
print("bought", pvp("buy", launched["mint"], "0.01", "--yes")["expectedTokens"], "tokens")
