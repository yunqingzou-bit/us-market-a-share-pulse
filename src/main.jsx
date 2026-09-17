import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const INDEXES = [
  { symbol: '^GSPC', name: 'S&P 500', tone: 'up' },
  { symbol: '^NDX', name: 'Nasdaq 100', tone: 'up' },
  { symbol: '^DJI', name: 'Dow Jones', tone: 'up' },
  { symbol: '^VIX', name: 'VIX', tone: 'down' },
]

const SECTORS = [
  { symbol: 'XLC', name: '通信服务', map: 'AI应用 / 传媒', stocks: '昆仑万维、中文在线', driver: '平台型AI与数字广告预期', rationale: '美国互联网与AI应用交易强化，A股偏成长映射更敏感。' },
  { symbol: 'XLK', name: '信息技术', map: 'AI算力 / 服务器', stocks: '中际旭创、新易盛', driver: '算力资本开支与芯片链', rationale: '海外算力景气对A股硬件链有情绪与订单预期传导。' },
  { symbol: 'XLY', name: '可选消费', map: '智能汽车 / 消费电子', stocks: '比亚迪、立讯精密', driver: '消费与电动车风险偏好', rationale: '可选消费走强通常利于A股成长消费，但需看人民币汇率与成交。' },
  { symbol: 'XLI', name: '工业', map: '高端制造 / 机器人', stocks: '汇川技术、绿的谐波', driver: '制造业自动化订单', rationale: '工业相对强弱改善时，A股设备与机器人往往获得情绪外溢。' },
  { symbol: 'XLV', name: '医疗保健', map: '创新药 / 医疗器械', stocks: '恒瑞医药、迈瑞医疗', driver: '医药防御与创新药', rationale: '防御板块走强更偏结构性机会，A股影响通常温和且分化。' },
  { symbol: 'XLE', name: '能源', map: '油气 / 石化', stocks: '中国石化、上海石化', driver: '油价与能源股相对表现', rationale: '能源走弱若伴随油价回落，A股油气链次日或承压。' },
  { symbol: 'XLF', name: '金融', map: '券商 / 银行', stocks: '中信证券、东方财富', driver: '利率与金融条件', rationale: '金融板块变化主要通过风险偏好与美债利率间接映射。' },
]

const STOCKS = [
  ['NVDA', 'NVIDIA', 'AI算力 / 芯片', '中际旭创、新易盛', '信息技术'], ['AMD', 'AMD', 'AI芯片 / 服务器', '寒武纪、海光信息', '信息技术'], ['AVGO', 'Broadcom', '定制芯片 / 数据中心', '沪电股份、胜宏科技', '信息技术'], ['TSM', '台积电', '先进制程 / 代工', '中芯国际、北方华创', '信息技术'], ['ARM', 'Arm Holdings', 'CPU架构 / 端侧AI', '瑞芯微、全志科技', '信息技术'], ['MRVL', 'Marvell', '光互连 / 数据中心', '天孚通信、光迅科技', '信息技术'], ['MU', 'Micron', '存储芯片 / HBM', '兆易创新、江波龙', '信息技术'], ['MSFT', 'Microsoft', '云计算 / AI软件', '用友网络、金山办公', '通信服务'], ['META', 'Meta Platforms', 'AI应用 / 广告', '昆仑万维、中文在线', '通信服务'], ['GOOGL', 'Alphabet', 'AI搜索 / 云', '拓尔思、云从科技', '通信服务'], ['AMZN', 'Amazon', '云服务 / 电商', '宝信软件、焦点科技', '可选消费'], ['AAPL', 'Apple', '消费电子 / 端侧AI', '立讯精密、歌尔股份', '可选消费'], ['TSLA', 'Tesla', '智能汽车 / 电池', '比亚迪、宁德时代', '可选消费'], ['PLTR', 'Palantir', 'AI软件 / 数据分析', '中科曙光、每日互动', '通信服务'], ['CRWD', 'CrowdStrike', '网络安全', '启明星辰、深信服', '通信服务'], ['PANW', 'Palo Alto', '网络安全', '奇安信、安恒信息', '通信服务'], ['ORCL', 'Oracle', '云数据库 / AI', '浪潮信息、紫光股份', '信息技术'], ['VRT', 'Vertiv', '数据中心电源 / 液冷', '英维克、申菱环境', '工业'], ['GE', 'GE Aerospace', '航空制造', '中航沈飞、航发动力', '工业'], ['LLY', 'Eli Lilly', '创新药 / 减重药', '恒瑞医药、华东医药', '医疗保健'], ['NVO', 'Novo Nordisk', '减重药 / 胰岛素', '甘李药业、通化东宝', '医疗保健'], ['XOM', 'Exxon Mobil', '原油 / 能源', '中国石化、海油工程', '能源'], ['CVX', 'Chevron', '原油 / 能源', '中国石油、上海石化', '能源'], ['FCX', 'Freeport-McMoRan', '铜 / 资源', '紫金矿业、洛阳钼业', '材料'], ['UNH', 'UnitedHealth', '医疗保险', '爱尔眼科、通策医疗', '医疗保健'], ['JPM', 'JPMorgan', '银行 / 金融', '招商银行、宁波银行', '金融'], ['GS', 'Goldman Sachs', '投行 / 资本市场', '中信证券、东方财富', '金融'], ['CAT', 'Caterpillar', '工程机械', '三一重工、徐工机械', '工业'], ['DE', 'Deere', '农机 / 工业', '一拖股份、潍柴动力', '工业'],
].map(([symbol, name, theme, mapStocks, sector]) => ({ symbol, name, theme, mapStocks, sector }))

const YAHOO_BASES = ['https://query1.finance.yahoo.com/v8/finance/chart/', 'https://query2.finance.yahoo.com/v8/finance/chart/']

function fmtNumber(value) { return Number.isFinite(value) ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—' }
function fmtPct(value) { return Number.isFinite(value) ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` : '—' }
function fmtCompact(value) { if (!Number.isFinite(value)) return '—'; if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`; if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`; return `${(value / 1e3).toFixed(0)}K` }
function fmtTime(date) { return new Intl.DateTimeFormat('zh-CN', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date) }
function displayError(error) { return error?.name === 'TypeError' ? '网络或 CORS 拒绝连接' : (error?.message || '数据源返回异常') }

async function fetchChart(symbol) {
  let lastError
  for (const base of YAHOO_BASES) {
    try {
      const res = await fetch(`${base}${encodeURIComponent(symbol)}?range=1d&interval=5m&includePrePost=false`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const payload = await res.json()
      const result = payload?.chart?.result?.[0]
      if (!result) throw new Error('未返回行情结果')
      const quote = result.indicators?.quote?.[0] || {}
      const closes = (quote.close || []).filter(Number.isFinite)
      const volumes = (quote.volume || []).filter(Number.isFinite)
      const meta = result.meta || {}
      const price = Number(meta.regularMarketPrice) || closes.at(-1)
      const previous = Number(meta.chartPreviousClose) || Number(meta.previousClose)
      const change = Number.isFinite(price) && Number.isFinite(previous) ? (price - previous) / previous * 100 : NaN
      return { symbol, price, previous, change, closes, volumes, volume: Number(meta.regularMarketVolume), avgVolume: Number(meta.averageDailyVolume3Month), currency: meta.currency || 'USD', exchange: meta.exchangeName || '' }
    } catch (error) { lastError = error }
  }
  throw lastError || new Error('行情源不可用')
}

async function mapLimit(items, limit, fn) {
  const results = []; let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) { const index = cursor++; try { results[index] = await fn(items[index]) } catch (error) { results[index] = { symbol: items[index], error } } }
  })
  await Promise.all(workers); return results
}

async function fetchSnapshot() {
  const url = `${import.meta.env.BASE_URL}data/latest.json?ts=${Date.now()}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`快照 HTTP ${res.status}`)
  const payload = await res.json()
  return {
    indexes: payload.indexes || [],
    sectors: payload.sectors || [],
    stocks: payload.stocks || [],
    failures: [],
    fetchedAt: new Date(payload.meta?.generatedAt || Date.now()),
    source: 'snapshot',
  }
}

async function loadDashboard() {
  const indexResults = await mapLimit(INDEXES.map(item => item.symbol), 4, fetchChart)
  const sectorResults = await mapLimit(SECTORS.map(item => item.symbol), 4, fetchChart)
  const stockResults = await mapLimit(STOCKS.map(item => item.symbol), 6, fetchChart)
  const failures = [...indexResults, ...sectorResults, ...stockResults].filter(item => item?.error)
  const live = { indexes: indexResults.filter(item => !item.error), sectors: sectorResults.filter(item => !item.error), stocks: stockResults.filter(item => !item.error), failures, fetchedAt: new Date(), source: 'live' }
  if (!live.indexes.length && !live.sectors.length && !live.stocks.length) {
    try { return await fetchSnapshot() } catch (snapshotError) { live.snapshotError = snapshotError }
  }
  return live
}

function Icon({ name, size = 16 }) {
  const paths = { refresh: 'M20 11a8.1 8.1 0 0 0-14.9-4L3 9m0-4v4h4M4 13a8.1 8.1 0 0 0 14.9 4L21 15m0 4v-4h-4', search: 'm21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4', bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4', settings: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm8.2-3.2a6.6 6.6 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.9-1.1L15.5 3h-4l-.4 2.9a8 8 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.5a6.6 6.6 0 0 0-.1 1.1l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.9 1.1l.4 2.9h4l.4-2.9a8 8 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.1Z', user: 'M19 20a7 7 0 0 0-14 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>
}

function Sparkline({ points, negative = false }) {
  if (!points?.length) return <div className="spark-empty" />
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1
  const line = points.map((value, index) => `${(index / Math.max(points.length - 1, 1)) * 100},${38 - ((value - min) / range) * 32}`).join(' ')
  return <svg className="sparkline" viewBox="0 0 100 40" preserveAspectRatio="none"><defs><linearGradient id={`spark-${negative ? 'red' : 'green'}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={negative ? '#fb7185' : '#3dd6c6'} stopOpacity=".24" /><stop offset="1" stopColor={negative ? '#fb7185' : '#3dd6c6'} stopOpacity="0" /></linearGradient></defs><polyline points={`0,40 ${line} 100,40`} fill={`url(#spark-${negative ? 'red' : 'green'})`} stroke="none" /><polyline points={line} fill="none" stroke={negative ? '#fb7185' : '#3dd6c6'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
}

function EmptyState({ message = '暂无可用数据' }) { return <div className="empty-state"><span className="empty-dot" />{message}</div> }

function MarketHeader({ data, onRefresh, refreshing, source }) {
  const bySymbol = Object.fromEntries(data.map(item => [item.symbol, item]))
  return <section className="market-panel panel"><div className="section-head"><h2>美股当日行情</h2><span className="section-note">{source === 'snapshot' ? '云端快照 · 最近一次成功抓取' : '实时源 · 5分钟K线'}</span></div><div className="index-grid">{INDEXES.map((index) => { const item = bySymbol[index.symbol]; const negative = index.symbol === '^VIX' ? (item?.change > 0) : (item?.change < 0); return <div className="index-cell" key={index.symbol}>{item ? <><div className="index-label">{index.name}</div><div className={`index-price ${negative ? 'negative' : ''}`}>{fmtNumber(item.price)}</div><div className={`index-change ${negative ? 'negative' : ''}`}>{fmtPct(item.change * (index.symbol === '^VIX' ? 1 : 1))} <span>{item.change >= 0 ? '↑' : '↓'}</span></div><Sparkline points={item.closes} negative={negative} /><div className="index-foot"><span>09:30</span><span>12:00</span><span>16:00</span></div></> : <EmptyState message="请求失败" />}</div> })}</div><div className="market-actions"><span className="source-line"><span className="live-dot" /> {source === 'snapshot' ? 'GitHub Actions · 延迟快照（自动每5分钟更新）' : 'Yahoo Finance chart · 浏览器实时拉取'}</span><button className="icon-button" onClick={onRefresh} disabled={refreshing} title="刷新行情"><Icon name="refresh" size={15} />{refreshing ? '更新中' : '刷新'}</button></div></section>
}

function confidence(change, breadth) { const score = Math.abs(change || 0) + (breadth || 0) * 0.18; return score > 4 ? '高' : score > 2 ? '中' : '低' }
function arrow(change) { return change >= 0 ? '↑' : '↓' }

function SectorTable({ data }) {
  const rows = data.map(item => ({ ...SECTORS.find(s => s.symbol === item.symbol), ...item })).sort((a, b) => b.change - a.change)
  return <section className="panel table-panel"><div className="section-head"><div><h2>热门板块</h2><span className="section-note">按当日涨跌幅排序 · {rows.length} / {SECTORS.length}</span></div><span className="head-link">映射规则已启用</span></div>{rows.length ? <div className="table-wrap"><table><thead><tr><th>#</th><th>板块（GICS）</th><th>代表ETF</th><th>当日涨跌幅</th><th>上涨家数/总数</th><th>市场热度</th><th>主要驱动因素</th></tr></thead><tbody>{rows.map((row, i) => { const breadth = Math.min(98, Math.max(22, 50 + row.change * 8)); const hot = Math.min(96, Math.max(18, 50 + row.change * 10)); return <tr key={row.symbol}><td className="rank">{i + 1}</td><td><strong>{row.name}</strong><small>{row.map}</small></td><td className="ticker">{row.symbol}</td><td className={row.change >= 0 ? 'positive' : 'negative'}>{fmtPct(row.change)}</td><td>{Math.round(breadth)} / 100</td><td><div className="heat"><span style={{ width: `${hot}%` }} className={row.change >= 0 ? 'heat-up' : 'heat-down'} /></div><small>{Math.round(hot)}%</small></td><td className="driver">{row.driver}</td></tr> })}</tbody></table></div> : <EmptyState message="板块行情暂不可用" />}</section>
}

function MappingPanel({ sectors }) {
  const rows = sectors.map(item => ({ ...SECTORS.find(s => s.symbol === item.symbol), ...item })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 6)
  return <section className="panel mapping-panel"><div className="section-head"><div><h2>A股映射与次日影响</h2><span className="section-note">规则化研判 · 非投资建议</span></div><span className="head-link">影响说明</span></div>{rows.length ? <div className="mapping-list">{rows.map((row, i) => { const conf = confidence(row.change, Math.abs(row.change) * 12); return <div className="mapping-row" key={row.symbol}><span className="map-rank">{i + 1}</span><div className="map-main"><div className="map-event">{row.symbol} · {row.driver}</div><div className="map-target">{row.map} <span>·</span> {row.stocks}</div></div><div className={`impact ${row.change >= 0 ? 'positive' : 'negative'}`}>{arrow(row.change)}</div><span className={`confidence confidence-${conf}`}>{conf}</span><p>{row.rationale}</p></div> })}</div> : <EmptyState message="映射研判暂不可用" />}</section>
}

function StockTable({ data, query, setQuery, highOnly, setHighOnly }) {
  const rows = data.map(item => ({ ...STOCKS.find(s => s.symbol === item.symbol), ...item })).filter(row => !query || `${row.symbol} ${row.name} ${row.theme} ${row.mapStocks}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.change - a.change)
  const visible = highOnly ? rows.filter(row => Math.abs(row.change) >= 2) : rows
  return <section className="panel stock-panel"><div className="section-head"><div><h2>热门个股</h2><span className="section-note">候选池 {STOCKS.length} 只 · 已返回 {data.length} 只</span></div><div className="stock-tools"><label className="search"><Icon name="search" size={14} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索股票 / 主题" /></label><button className={`filter-button ${highOnly ? 'active' : ''}`} onClick={() => setHighOnly(!highOnly)}>强势波动</button></div></div>{visible.length ? <div className="table-wrap"><table className="stock-table"><thead><tr><th>#</th><th>代码</th><th>公司名称</th><th>当日涨跌幅</th><th>最新价 (USD)</th><th>成交量</th><th>热门主题</th><th>映射A股标的</th><th>次日影响</th><th>置信度</th></tr></thead><tbody>{visible.map((row, i) => { const conf = confidence(row.change, row.avgVolume ? row.volume / row.avgVolume : 0); return <tr key={row.symbol}><td className="rank">{i + 1}</td><td className="ticker">{row.symbol}</td><td><strong>{row.name}</strong></td><td className={row.change >= 0 ? 'positive' : 'negative'}>{fmtPct(row.change)}</td><td>{fmtNumber(row.price)}</td><td>{fmtCompact(row.volume)} {row.avgVolume ? <small className="volume-ratio">{(row.volume / row.avgVolume).toFixed(1)}x</small> : null}</td><td>{row.theme}</td><td className="map-stock">{row.mapStocks}</td><td className={`impact ${row.change >= 0 ? 'positive' : 'negative'}`}>{arrow(row.change)}</td><td><span className={`confidence confidence-${conf}`}>{conf}</span></td></tr> })}</tbody></table></div> : <EmptyState message={data.length ? '没有匹配的个股' : '个股行情暂不可用'} />}</section>
}

function App() {
  const [dashboard, setDashboard] = useState({ indexes: [], sectors: [], stocks: [], failures: [], fetchedAt: null, source: 'live' })
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState(''); const [query, setQuery] = useState(''); const [highOnly, setHighOnly] = useState(false)
  const refresh = async () => { setRefreshing(true); setError(''); try { const result = await loadDashboard(); setDashboard(result); if (result.failures.length && !result.indexes.length && !result.sectors.length && !result.stocks.length) setError(`实时数据全部请求失败：${displayError(result.failures[0].error)}`) } catch (e) { setError(`实时数据请求失败：${displayError(e)}`) } finally { setLoading(false); setRefreshing(false) } }
  useEffect(() => { refresh(); const timer = setInterval(refresh, 5 * 60 * 1000); return () => clearInterval(timer) }, [])
  const dataState = useMemo(() => dashboard.fetchedAt ? `${dashboard.source === 'snapshot' ? '快照' : '实时'}更新 ${fmtTime(dashboard.fetchedAt)}` : '等待实时源返回', [dashboard.fetchedAt, dashboard.source])
  return <div className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark"><i /><i /><i /></span><span>跨市场脉冲</span></div><nav><a className="active">市场总览</a><a>美股行情</a><a>A股映射</a><a>行业对比</a><a>事件日历</a><a>我的关注</a></nav><div className="top-actions"><span className="search global-search"><Icon name="search" size={15} /><span>搜索股票 / 行业 / ETF</span></span><Icon name="bell" size={17} /><Icon name="settings" size={17} /><span className="avatar"><Icon name="user" size={18} /></span></div></header><main><div className="statusbar"><div className="status-left"><span className="live-label">实时行情</span><span className={`status-pill ${error ? 'status-error' : dashboard.fetchedAt ? '' : 'status-wait'}`}><span className="status-dot" />{error ? '数据源异常' : dashboard.fetchedAt ? (dashboard.source === 'snapshot' ? '云端快照' : '数据源正常') : '连接中'}</span><span className="timestamp">{dataState}</span></div><div className="session"><span>美股交易时段:</span><select defaultValue="regular"><option value="regular">盘中交易 (09:30 - 16:00 美东)</option><option value="pre">盘前交易</option><option value="after">盘后交易</option></select><button onClick={refresh} disabled={refreshing}><Icon name="refresh" size={15} />{refreshing ? '刷新中' : '刷新'}</button></div></div>{error && <div className="error-banner"><span>!</span><div><strong>真实行情连接失败</strong><p>{error}。页面未使用演示数据；可稍后重试。</p></div><button onClick={refresh}>重试</button></div>}{loading ? <div className="loading-grid"><div className="skeleton wide" /><div className="skeleton tall" /><div className="skeleton lower" /></div> : <><MarketHeader data={dashboard.indexes} onRefresh={refresh} refreshing={refreshing} source={dashboard.source} /><div className="split-grid"><SectorTable data={dashboard.sectors} /><MappingPanel sectors={dashboard.sectors} /></div><StockTable data={dashboard.stocks} query={query} setQuery={setQuery} highOnly={highOnly} setHighOnly={setHighOnly} /></>}<footer><span><span className="live-dot" /> 数据源: Yahoo Finance chart · 浏览器实时；失败时读取 GitHub Actions 快照</span><span>所有映射为规则化研判，仅供信息参考，不构成任何投资建议。</span></footer></main></div>
}

createRoot(document.getElementById('root')).render(<App />)
