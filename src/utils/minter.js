import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import axios from "axios";
import { ethers } from "ethers";

function getAccessToken () {
  // If you're just testing, you can paste in a token
  // and uncomment the following line:
  // return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGExYjVlODFDMDQyNWNiNzAxMUUwQTJEZTZBMEYwZmY1MzM1RTQ4YzciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjM3OTg4OTYwNDYsIm5hbWUiOiJDbGFzc2ljIENhcnMifQ.cR2UY0OMvA8t-B1qTPKBKgGUkWyx_TW8OBEM_x9V9_A"

  // In a real app, it's better to read an access token from an
  // environement variable or other configuration that's kept outside of
  // your code base. For this to work, you need to set the
  // WEB3STORAGE_TOKEN environment variable before you run your code.
  // return process.env.WEB3STORAGE_TOKEN
  return process.env.REACT_APP_STORAGE_API_KEY
}

function makeStorageClient () {
  return new Web3Storage({ token: getAccessToken() })
}
// const client = makeStorageClient();

function uploadFile (file) {
  const client = makeStorageClient();
  const fileCid = client.put(file);
  return fileCid;
}

function makeFileObjects (file, fileName) {
  const blob = new Blob([JSON.stringify(file)], { type: "application/json" })
  const files = [new File([blob], `${fileName}.json`)]
  return files
}

function trimmedName (name) {
  let file_name;
  const trim_name = name.trim() // removes extra whitespaces
  if(trim_name.includes(" ")) {
    file_name = trim_name.replaceAll(" ", "%20")
    return file_name
  }
  return trim_name
}

export const createNft = async (
  minterContract,
  performActions,
  { name, description, ipfsImage, ownerAddress, price }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage || !price) return;
    const { defaultAccount } = kit;
    
    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      description,
      image: ipfsImage
    });

    try {
      // save NFT metadata to IPFS
      const fileName = trimmedName(name);
      const files = makeFileObjects(data, name);
      const fileCid = await uploadFile(files);

      const url = `https://${fileCid}.ipfs.w3s.link/${fileName}.json`;
      const _price = ethers.utils.parseUnits(String(price), "ether");

      // mint the NFT and save the IPFS url to the blockchain
      await minterContract.methods.uploadClassicCar(name, ipfsImage, description, _price).send({from: defaultAccount});
      let transaction = await minterContract.methods.safeMint(defaultAccount, url).send({ from: defaultAccount });

      return transaction;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
};

export const uploadFileToWebStorage = async (e) => {
  const file = e.target.files;
  const fileName = file[0].name;

  if (!file) return;
  // Pack files into a CAR and send to web3.storage
  const rootCid = await uploadFile(file) // Promise<CIDString>
  const url = `https://${rootCid}.ipfs.w3s.link/${fileName}`

  return url;
};

export const getNfts = async (minterContract) => {
  try {
    const nfts = [];
    const nftsLength = await minterContract.methods.totalSupply().call();
    for (let i = 0; i < Number(nftsLength); i++) {
      const nft = new Promise(async (resolve) => {
        const res = await minterContract.methods.tokenURI(i).call();
        const meta = await fetchNftMeta(res);
        const owner = await fetchNftOwner(minterContract, i);
        const market = await minterContract.methods.isCarInMarket(i).call();
        const sold = await minterContract.methods.isCarSold(i).call();
        const classicCar = await minterContract.methods.readClassicCars(i).call();

        resolve({
          index: i,
          owner,
          name: meta.name,
          image: meta.image,
          description: meta.description,
          price: classicCar[5],
          sold,
          market
        });
      });
      nfts.push(nft);
    }
    return Promise.all(nfts);
  } catch (e) {
    console.log({ e });
  }
};

export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    console.log("Getting data")
    const meta = await axios.get(ipfsUrl);
    const data = JSON.parse(meta.data)

    return data;
  } catch (e) {
    console.log({ e });
  }
};

export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

export async function buyNft (minterContract, tokenId, performActions) {
  try {
    await performActions(async function(kit) {
      const {defaultAccount} = kit
      const classicCar = await minterContract.methods.readClassicCars(tokenId).call();
      await minterContract.methods.buyClassicCar(tokenId).send({from: defaultAccount, value: classicCar[5]});
    })
  }
  catch(err) {
    console.log(err)
  }
};

export async function giftNft (minterContract, tokenId, recipientAddress, performActions) {
  try {
    await performActions(async function(kit) {
      const {defaultAccount} = kit
      await minterContract.methods.giftClassicCar(tokenId, recipientAddress).send({from: defaultAccount});
    })
  }
  catch(err) {
    console.log(err)
  }
};

export async function resellNft (minterContract, tokenId, newPrice, performActions) {
  try {
    await performActions(async function(kit) {
      const {defaultAccount} = kit
      await minterContract.methods.resellClassicCar(tokenId, newPrice).send({from: defaultAccount});
    })
  }
  catch(err) {
    console.log(err)
  }
};