import re

with open('src/components/Welcome.astro', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()

for i, line in enumerate(lines):
    # Check for large fixed widths or min-widths or 100vw or anything suspicious
    if any(k in line for k in ['w-[', 'min-w-', 'w-screen', '100vw', 'translate-x', 'left-1/2']):
        print(f"Line {i+1}: {line.strip()[:100]}")
