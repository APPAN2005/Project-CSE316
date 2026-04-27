@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
  --bg: #0b0d12;
  --bg-panel: rgba(17, 21, 30, 0.92);
  --line: rgba(255, 255, 255, 0.08);
  --text: #edf2f7;
  --muted: #98a2b3;
  --cyan: #4fd1ff;
  --amber: #f5c451;
  --ember: #ff6b57;
  --good: #4ade80;
  --surface: rgba(255, 255, 255, 0.03);
}

* {
  box-sizing: border-box;
}

html {
  background:
    radial-gradient(circle at top, rgba(79, 209, 255, 0.12), transparent 30%),
    linear-gradient(180deg, #10141b 0%, #0b0d12 100%);
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  font-family: var(--font-ibm-plex-sans), sans-serif;
  font-size: 16px;
  background:
    radial-gradient(circle at 0% 0%, rgba(79, 209, 255, 0.08), transparent 25%),
    linear-gradient(180deg, #11151d 0%, #0b0d12 100%);
}

p,
span,
label,
button,
input,
select,
textarea,
td,
th {
  font-size: max(1rem, 16px);
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.018) 0,
    rgba(255, 255, 255, 0.018) 1px,
    transparent 2px,
    transparent 4px
  );
  opacity: 0.18;
  z-index: 40;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 0%, rgba(79, 209, 255, 0.06), transparent 40%);
  z-index: 39;
}

a {
  color: inherit;
  text-decoration: none;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(7, 16, 21, 0.8);
}

::-webkit-scrollbar-thumb {
  background: rgba(111, 243, 255, 0.22);
  border: 1px solid rgba(111, 243, 255, 0.16);
}

.panel-frame {
  position: relative;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(22, 27, 37, 0.96), rgba(13, 17, 24, 0.96));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.26), 0 24px 60px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.panel-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 24%);
}

.status-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.875rem;
  font-weight: 600;
}

.text-glow {
  text-shadow: 0 0 14px rgba(79, 209, 255, 0.16);
}

.amber-glow {
  text-shadow: 0 0 14px rgba(245, 196, 81, 0.16);
}

.font-numeric {
  font-family: var(--font-jetbrains-mono), monospace;
  font-variant-numeric: tabular-nums;
}

.section-title {
  font-size: 1.65rem;
  line-height: 1.2;
  font-weight: 700;
}

.section-copy {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.6;
}

.animate-pulse-soft {
  animation: pulse-soft 1.8s ease-in-out infinite;
}

.live-dot {
  animation: live-pulse 1.6s ease-in-out infinite;
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 0.75;
    transform: scale(1);
    box-shadow: 0 0 0 rgba(74, 222, 128, 0.2);
  }
  50% {
    opacity: 1;
    transform: scale(1.18);
    box-shadow: 0 0 18px rgba(74, 222, 128, 0.6);
  }
}

@keyframes pulse-soft {
  0%,
  100% {
    opacity: 0.72;
  }
  50% {
    opacity: 1;
  }
}

@keyframes blink-caret {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0.2;
  }
}
