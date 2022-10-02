const hre = require("hardhat");

async function main() {
  const ClassicCars = await hre.ethers.getContractFactory("ClassicCars");
  const myNFT = await ClassicCars.deploy();

  await myNFT.deployed();

  console.log("ClassicCars deployed to:", myNFT.address);
  storeContractData(myNFT);
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/ClassicCars-address.json",
    JSON.stringify({ ClassicCars: contract.address }, undefined, 2)
  );

  const ClassicCarsArtifact = artifacts.readArtifactSync("ClassicCars");

  fs.writeFileSync(
    contractsDir + "/ClassicCars.json",
    JSON.stringify(ClassicCarsArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });