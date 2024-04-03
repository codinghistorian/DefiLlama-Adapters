const sdk = require("@defillama/sdk");
const { getUniTVL } = require("../helper/unknownTokens");

const getDefaultQueueAbi = {
  "constant": true,
  "inputs": [],
  "name": "getDefaultQueue",
  "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
};

const getVaultsAbi = {
  "constant": true,
  "inputs": [],
  "name": "getVaults",
  "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
};

const chain = 'xdc';
const WXDC = '0x951857744785e80e2de051c32ee7b25f9c458c42';
const WXDCHolders = [
  '0x9B4aCeFE2dB986Ca080Dc01d137e6566dBE0aA3a', // CDP Vault CollateralPoolId "0x5844430000000000000000000000000000000000000000000000000000000000"
];
const FathomVaultFactoryAddress = "0x0c6e3fd64D5f33eac0DCCDd887A8c7512bCDB7D6";
const FXD = '0x49d3f7543335cf38Fa10889CCFF10207e22110B5';


const fetchWXDCBalances = async (timestamp, block, chainBlocks) => {
  const balances = {};
  const blockXdc = chainBlocks[chain];

  for (const holder of WXDCHolders) {
    const balance = await sdk.api.erc20.balanceOf({
      target: WXDC,
      owner: holder,
      block: blockXdc,
      chain,
    });
    sdk.util.sumSingleBalance(balances, `${chain}:${WXDC}`, balance.output);
  }

  return balances;
};

const fetchFXDBalances = async (timestamp, block, chainBlocks) => {
  const balances = {};
  const blockXdc = chainBlocks[chain];

  const vaultAddressesResult = await sdk.api.abi.call({
    target: FathomVaultFactoryAddress,
    abi: getVaultsAbi,
    block: blockXdc,
    chain,
  });

  const vaultAddresses = vaultAddressesResult.output;

  const queueAddresses = await Promise.all(vaultAddresses.map(async (vaultAddress) => {
    const result = await sdk.api.abi.call({
      target: vaultAddress,
      abi: getDefaultQueueAbi,
      block: blockXdc,
      chain,
    });
    return result.output;
  }));

  const flattenedQueueAddresses = queueAddresses.flat();

  const allAddresses = [...vaultAddresses, ...flattenedQueueAddresses];

  for (const address of allAddresses) {
    const balance = await sdk.api.erc20.balanceOf({
      target: FXD,
      owner: address,
      block: blockXdc,
      chain,
    });

    sdk.util.sumSingleBalance(balances, `${chain}:${FXD}`, balance.output);
  }

  return balances;
};

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

