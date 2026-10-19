// Node.js 22+. Server-side only. This example never sends a game login code.
const apiKey = process.env.MLBB_API_KEY;
const playerKey = process.env.MLBB_PLAYER_KEY;
if (!apiKey || !/^[1-9]\d*-[1-9]\d*$/.test(playerKey || '')) {
  console.error('Set MLBB_API_KEY and MLBB_PLAYER_KEY (playerId-serverId) on your server.');
  process.exitCode = 1;
} else {
  try {
    const url = new URL(`https://mlbb-stats.ru/api/v1/players/${playerKey}`);
    url.searchParams.set('include', 'stats');
    url.searchParams.set('fields', 'name,level,currentRank.stars,stats.games,stats.winRate');
    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    let result;
    try { result = await response.json(); } catch { result = null; }
    if (!response.ok || !result || !Object.hasOwn(result, 'data')) {
      console.error({
        status: response.status,
        code: result?.error?.code ?? 'unexpected_response',
        requestId: result?.meta?.requestId ?? response.headers.get('x-request-id'),
        retryAfterSeconds: response.headers.get('retry-after'),
      });
      process.exitCode = 1;
    } else {
      // Public profile fields only. Never log auth/verify responses this way.
      console.log(JSON.stringify(result, null, 2));
    }
  } catch {
    console.error('Network request failed or timed out. No automatic retry was performed.');
    process.exitCode = 1;
  }
}
