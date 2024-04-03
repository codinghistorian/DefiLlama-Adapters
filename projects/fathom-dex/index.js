const sdk = require("@defillama/sdk");
const { getUniTVL } = require("../helper/unknownTokens");

const WXDC = '0x951857744785e80e2de051c32ee7b25f9c458c42';
const WXDCHolders = '0x9B4aCeFE2dB986Ca080Dc01d137e6566dBE0aA3a'; // CDP Vault CollateralPoolId "0x5844430000000000000000000000000000000000000000000000000000000000"

const FXD = '0x49d3f7543335cf38Fa10889CCFF10207e22110B5';
const FXDHolders = [
  "0x3C8e9896933B374E638f9a5C309535409129aaA2", // Vault0
  "0xE2DEa7e0c272dE04e8708674dAE73ebd6E5c1455", // Strategy0 of Vault0
]

const fetchWXDCBalances = async (timestamp, block, chainBlocks) => {
  const balances = {};
  const chain = 'xdc';
  const blockXdc = chainBlocks[chain];
  const balance = await sdk.api.erc20.balanceOf({
    target: WXDC,
    owner: WXDCHolders,
    block: blockXdc,
    chain,
  });

  sdk.util.sumSingleBalance(balances, `${chain}:${WXDC}`, balance.output);
  return balances;
};

const fetchFXDBalances = async (timestamp, block, chainBlocks) => {
  const balances = {};
  const chain = 'xdc';
  const blockXdc = chainBlocks[chain];
  for (const fxdHolder of FXDHolders) {
    const balance = await sdk.api.erc20.balanceOf({
      target: FXD,
      owner: fxdHolder,
      block: blockXdc,
      chain,
    });

    sdk.util.sumSingleBalance(balances, `${chain}:${FXD}`, balance.output);
  }
  return balances;
}

module.exports = {
  xdc: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({
        factory: '0x9fAb572F75008A42c6aF80b36Ab20C76a38ABc4B',
        useDefaultCoreAssets: true,
      }),
      fetchWXDCBalances,
      fetchFXDBalances,
    ]),
  },
};

