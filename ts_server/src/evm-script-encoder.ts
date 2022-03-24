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

/**
 * Creates a list of of params and their data
 *
 * @param types list of param types
 * @param params list of param values
 * @returns
 */
const encodedParams = (types: any, values: any[]) => {
  const typesList = types.split(",");

  return typesList.map((type: any, index: number) => {
    return {
      type,
      value: values[index],
      encoded: abi.encodeParameter(type, values[index]),
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
  const encodedParamsList = types ? encodedParams(types, params) : [];
  const script = encodeCallScript([action]);
  return {
    address,
    functionSignature,
    encodedParams: encodedParamsList,
    script,
  };
};

/**
 * Encode an event signature
 *
 * @param signature event signature, i.e. Voted(uint)
 * @returns topic[0] for an event log
 */
export const encodeEventSig = (signature: string) => {
  return abi.encodeEventSignature(signature);
};
