const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config({ path: "./.env" });

// The JSON-RPC API is popular method for interacting with Ethereum. It typically provides:
// A connection to the Ethereum network (a Provider)
// Holds your private key and can sign things (a Signer)

const RPC = process.env.RPC;
const KEY = process.env.PRIVATE_KEY;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(KEY, provider); // wallet, our private key used to sign transactions
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8"); // interface, our code knows how to interact with the contract
  const bin = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf8"); // binary, main compiled code of the contract

  // deploying with transaction data
  const nonce = await wallet.getTransactionCount(); // automatically get correct nonce
  const tx = {
    // nonce: 6, // manually get nounce which could be stressful
    nonce, // manually get nounce which could be stressful
    gasPrice: 2_000_000_000,
    gasLimit: 1_000_000,
    to: null,
    value: 0,
    data: `0x${bin}`,
    chainId: 31337,
  };

  // const signedTx = await wallet.signTransaction(tx); // this signed the transaction without sending
  // console.log(signedTx);
  const sentTx = await wallet.sendTransaction(tx); // this automatically signed the transaction before sending
  await sentTx.wait(1); //
  console.log(sentTx);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
