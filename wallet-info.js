const fs = require('fs');

// Function to save wallet information to a file
function saveWalletInfo(walletInfo) {
  const content = JSON.stringify(walletInfo, null, 2);
  fs.writeFileSync('./wallet-info.json', content);
  console.log('Wallet information saved to wallet-info.json');
}

module.exports = { saveWalletInfo };
