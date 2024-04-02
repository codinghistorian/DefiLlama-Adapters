const sdk = require("@defillama/sdk");
const { getUniTVL } = require("../helper/unknownTokens");

const WXDC = '0x951857744785e80e2de051c32ee7b25f9c458c42';
const vaultAddress = '0x9B4aCeFE2dB986Ca080Dc01d137e6566dBE0aA3a';

const fetchWXDCBalanceInVault = async (timestamp, block, chainBlocks) => {
  const balances = {};
  const chain = 'xdc';
  const blockXdc = chainBlocks[chain];
  const balance = await sdk.api.erc20.balanceOf({
    target: WXDC,
    owner: vaultAddress,
    block: blockXdc,
    chain,
  });

  sdk.util.sumSingleBalance(balances, `${chain}:${WXDC}`, balance.output);
  return balances;
};

module.exports = {
  xdc: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({
        factory: '0x9fAb572F75008A42c6aF80b36Ab20C76a38ABc4B',
        useDefaultCoreAssets: true,
      }),
      fetchWXDCBalanceInVault,
    ]),
  },
};

