const localtunnel = require('localtunnel');

module.exports = {
  // define props
  configSchema: {
    subdomain: {
      type: 'string',
      description:
        'A string value requesting a specific subdomain on the proxy server'
    },
    localhost: {
      type: 'string',
      description: 'Proxy to this hostname instead of localhost'
    },
    host: {
      type: 'string',
      description:
        'use your own localtunnel server, defualt is "https://localtunnel.me"'
    }
  },
  hooks: {
    async onCreate({ config, events, logger }) {
      let tunnel;

      events.on('ready', () => {
        const stopSpin = logger.spin('connecting to localtunnel...');
        const port = config.get('$.port');
        tunnel = localtunnel(
          port,
          {
            host: config.get('host'),
            local_host: config.get('localhost'),
            subdomain: config.get('subdomain')
          },
          (err, tunnel) => {
            stopSpin();
            if (err)
              logger.error(
                `localtunnel setup failed, beacuse {err.stack || err.message}`
              );
            logger.notify(`url is available on ${tunnel.url}`);
          }
        );
        tunnel.on('error', err => {
          logger.error(err.message);
        });
      });
      // onCreate
      return () => {
        if (tunnel) tunnel.close();
      };
    }
  }
};
