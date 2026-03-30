const fs = require('fs');

async function test() {
  const chokidarMod = await import('chokidar');
  const watchFn = chokidarMod.default ? chokidarMod.default.watch : chokidarMod.watch;
  console.log("Starting watcher...");
  const watcher = watchFn('/Users/jesbelmr/Desktop/project-test/logs/test-website.log', { persistent: true });
  
  watcher.on('all', (evt, p) => {
     console.log("EVENT:", evt, p);
  });
}
test();
