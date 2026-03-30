const { execSync } = require("child_process");

exports.default = async function(context) {
  const appPath = context.appOutDir;
  console.log(`  • cleaning xattrs  path=${appPath}`);
  try {
    execSync(`xattr -cr "${appPath}"`);
  } catch (err) {
    console.warn(`  • xattr cleanup failed: ${err.message}`);
  }
};
