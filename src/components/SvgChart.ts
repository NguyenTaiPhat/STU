import { type ChartDataPoint } from '../types/portal.types';

const CHART_H = 200;
const CHART_PAD = 40;
const BAR_GAP = 8;
const LABEL_H = 30;

export function renderBarChart(
  data: ChartDataPoint[],
  options?: { height?: number; showValues?: boolean }
): HTMLElement {
  const height = options?.height ?? CHART_H;
  const showValues = options?.showValues ?? true;
  const maxVal = Math.max(...data.map(d => d.value), 0.01);
  const totalW = data.length * 60;
  const svgW = totalW + CHART_PAD * 2;
  const svgH = height + CHART_PAD + LABEL_H;

  const wrap = document.createElement('div');
  wrap.className = 'relative';
  wrap.style.overflowX = 'auto';

  let barsHTML = '';
  let labelsHTML = '';

  data.forEach((d, i) => {
    const barW = Math.max((totalW / data.length) - BAR_GAP, 20);
    const barH = (d.value / maxVal) * height;
    const x = CHART_PAD + i * (barW + BAR_GAP);
    const y = height - barH + 10;

    barsHTML += `
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}"
        rx="4" fill="${d.color}" stroke="var(--neo-border-color)" stroke-width="2"
        style="transform-origin:${x + barW / 2}px ${height + 10}px;animation:barGrow 0.5s ease ${i * 0.1}s both"
        data-tooltip="${d.tooltip ?? `${d.label}: ${d.value}`}" class="chart-bar"/>
    `;

    if (showValues) {
      barsHTML += `<text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle"
        font-family="var(--font-mono)" font-size="11" font-weight="700"
        fill="var(--neo-text)">${d.value.toFixed(2)}</text>`;
    }

    labelsHTML += `<text x="${x + barW / 2}" y="${height + 28}" text-anchor="middle"
      font-family="var(--font-heading)" font-size="11" font-weight="600"
      fill="var(--neo-text-secondary)">${d.label}</text>`;
  });

  const axisLine = `<line x1="${CHART_PAD - 5}" y1="${height + 10}" x2="${svgW - CHART_PAD + 10}" y2="${height + 10}"
    stroke="var(--neo-border-color)" stroke-width="2"/>`;

  wrap.innerHTML = `
    <svg width="100%" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet">
      ${axisLine}${barsHTML}${labelsHTML}
    </svg>
  `;

  const tooltip = document.createElement('div');
  tooltip.className = 'neo-badge neo-badge--ghost';
  tooltip.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;opacity:0;transition:opacity 0.15s;font-size:12px;white-space:nowrap;z-index:10;background:var(--neo-card-bg);border:var(--neo-border);padding:4px 10px;box-shadow:var(--neo-shadow)';
  wrap.appendChild(tooltip);

  wrap.addEventListener('mouseover', (e) => {
    const t = (e.target as SVGElement).dataset.tooltip;
    if (!t) { tooltip.style.opacity = '0'; return; }
    tooltip.textContent = t;
    tooltip.style.opacity = '1';
  });

  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
    tooltip.style.top = (e.clientY - rect.top - 30) + 'px';
  });

  wrap.addEventListener('mouseout', () => { tooltip.style.opacity = '0'; });

  return wrap;
}
