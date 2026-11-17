const { handleAtlassianRoute } = require('./_atlassian-handlers.js');

async function handler(arg1, arg2) {
  let route = '';
  if (arg1 && arg1.query && arg1.query.route) {
    route = arg1.query.route;
  } else if (arg1 && arg1.queryStringParameters && arg1.queryStringParameters.route) {
    route = arg1.queryStringParameters.route;
  } else if (arg1 && typeof arg1.url === 'string') {
    try {
      const parsed = new URL(arg1.url, 'http://localhost');
      route = parsed.searchParams.get('route') || '';
      if (!route) {
        const segments = parsed.pathname.split('/').filter(Boolean);
        route = segments[segments.length - 1] || '';
      }
    } catch {
      // ignore
    }
  }

  return handleAtlassianRoute(route, arg1, arg2);
}

module.exports = handler;
module.exports.handler = handler;
