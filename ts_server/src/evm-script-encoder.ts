const abi = require("web3-eth-abi");
const { encodeCallScript } = require("@aragon/test-helpers/evmScript");

/**
 * Encode ACT function call
 * @param {string} signature Function signature
 * @param {any[]} params
 */
const encodeActCall = (sigBytes: any, types: any, params: any[]) => {
  // No params, return signature directly
  if (types === "") {
    return sigBytes;
  }

  const paramBytes = abi.encodeParameters(types.split(","), params);

  return `${sigBytes}${paramBytes.slice(2)}`;
};

const encodedParams = (types: any, params: any[]) => {
  const typesList = types.split(",");

  return typesList.map((type: any, index: number) => {
    return {
      type,
      param: params[index],
      encoded: abi.encodeParameter(type, params[index]),
    };
  });
};

/**
 * Encode EVM script for proposal
 * example:
 * const votingAddress = "0x..."
 * encodeEvmScript("setRoboRatePerBlock(uint)", [1], votingAddress)
 *
 * @param {string} signature Function signature to be called on proposal pass
 * @param {any[]} params Function params
 * @param {string} target Address of contract that has address to call
 */
export const encodeEvmScript = (
  signature: string,
  params: any[],
  address: string
) => {
  const functionSignature = abi.encodeFunctionSignature(signature);
  const types = signature.replace(")", "").split("(")[1];
  const action = {
    to: address,
    calldata: encodeActCall(functionSignature, types, params),
  };
  const encodedParamsList = encodedParams(types, params);
  const script = encodeCallScript([action]);
  return {
    address,
    functionSignature,
    encodedParams: encodedParamsList,
    script,
  };
};

export const encodeEventSig = (signature: string) => {
  return abi.encodeEventSignature(signature);
};
