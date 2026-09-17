import json
import ssl
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

INDEXES = ['^GSPC', '^NDX', '^DJI', '^VIX']
SECTORS = ['XLC', 'XLK', 'XLY', 'XLI', 'XLV', 'XLE', 'XLF']
STOCKS = ['NVDA','AMD','AVGO','TSM','ARM','MRVL','MU','MSFT','META','GOOGL','AMZN','AAPL','TSLA','PLTR','CRWD','PANW','ORCL','VRT','GE','LLY','NVO','XOM','CVX','FCX','UNH','JPM','GS','CAT','DE']

def fetch(symbol):
    query = urllib.parse.urlencode({'range': '1d', 'interval': '5m', 'includePrePost': 'false'})
    for host in ('query1.finance.yahoo.com', 'query2.finance.yahoo.com'):
        url = f'https://{host}/v8/finance/chart/{urllib.parse.quote(symbol, safe="")}?{query}'
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=20, context=ssl.create_default_context()) as response:
                payload = json.load(response)
            result = payload['chart']['result'][0]
            meta = result.get('meta', {})
            quote = (result.get('indicators', {}).get('quote') or [{}])[0]
            closes = [x for x in (quote.get('close') or []) if isinstance(x, (int, float))]
            price = meta.get('regularMarketPrice') or (closes[-1] if closes else None)
            previous = meta.get('chartPreviousClose') or meta.get('previousClose')
            change = ((price - previous) / previous * 100) if price is not None and previous else None
            return {'symbol': symbol, 'price': price, 'previous': previous, 'change': change, 'closes': closes, 'volumes': [x for x in (quote.get('volume') or []) if isinstance(x, (int, float))], 'volume': meta.get('regularMarketVolume'), 'avgVolume': meta.get('averageDailyVolume3Month'), 'currency': meta.get('currency', 'USD'), 'exchange': meta.get('exchangeName', '')}
        except Exception:
            continue
    return None

def collect(symbols):
    rows = []
    for symbol in symbols:
        row = fetch(symbol)
        if row:
            rows.append(row)
        time.sleep(0.08)
    return rows

payload = {
    'meta': {'generatedAt': datetime.now(timezone.utc).isoformat(), 'source': 'Yahoo Finance chart', 'kind': 'delayed-snapshot'},
    'indexes': collect(INDEXES),
    'sectors': collect(SECTORS),
    'stocks': collect(STOCKS),
}
with open('public/data/latest.json', 'w', encoding='utf-8') as handle:
    json.dump(payload, handle, ensure_ascii=False, separators=(',', ':'))
print(json.dumps({'indexes': len(payload['indexes']), 'sectors': len(payload['sectors']), 'stocks': len(payload['stocks']), 'generatedAt': payload['meta']['generatedAt']}))
