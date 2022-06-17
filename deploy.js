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

  // ContractFactory is used to deploy contract
  const contractFactory = new ethers.ContractFactory(abi, bin, wallet);

  const contract = await contractFactory.deploy();
  // const contract = await contractFactory.deploy({
  //   gasPrice: 1_000_00, // deploy with gasPrice
  // });
  // The address is available immediately, but the contract is NOT deployed yet
  console.log("===============contract address================");
  console.log(contract.address);
  // console.log("===============contract");
  // console.log(contract);
  // console.log("===============contract================");

  // console.log("deployment transaction");
  // console.log(contract.deployTransaction); // this is available when you create a transaction. this is the transaction that the signer sent to deploy

  await contract.deployTransaction.wait(1); // wait for 1 block confirmation to make sure contract was deployed
  // console.log("deployment receipt");
  // console.log(transactionReceipt);

  // we have access to the contract abi at this point because the contract has been deployed
  const favouriteNumberHex = await contract.retrieve();
  const favouriteNumber = favouriteNumberHex.toString();
  console.log({ favouriteNumberHex, favouriteNumber });

  // This is going to cost gas cause we are interacting with state on blockchain
  const transactionResponse = await contract.store("7"); // always pass argument as strings. Javascript doesn't understand big number.
  const transactionReceipt = await transactionResponse.wait(1); //

  const updatedFavNumHex = await contract.retrieve();
  console.log({ updatedFavNumHex, updatedFavNum: updatedFavNumHex.toString() });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
