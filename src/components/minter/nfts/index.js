import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import { Row } from "react-bootstrap";
import { ethers } from "ethers";
import {
  getNfts,
  createNft,
  buyNft,
  giftNft,
  resellNft
} from "../../../utils/minter";

const NftList = ({ minterContract, name }) => {
  const { performActions, address } = useContractKit();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAssets = useCallback(async () => {
    try {
      setLoading(true);
      const allNfts = await getNfts(minterContract);
      if (!allNfts) return;
      setNfts(allNfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract]);

  // function to add new nft to the nft lists
  // uses the data received from the Add.js component
  // 
  const addAsset = async (data) => {
    try {
      setLoading(true);
      await createNft(minterContract, performActions, data);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };

  // function to change the data of the nft stored
  // only the owner of the nft and the price can be changed
  // uses the data gotten from the Card.js component
  async function changeAsset(formData) {
    console.log(formData);
    const {data, name, index} = formData;

    console.log(name);


    if(name.includes("Gift")) {
      console.log(`Gift index of ${index}, to: ${data}`)
      await giftNft(minterContract, index, data, performActions);

      getAssets();
    }
    
    else if(name === "Resell") {
      // const sellPrice = Number(data)
      const price = ethers.utils.parseUnits(String(data), "ether");
      console.log(`Resell index of ${index}, at ${price}`)
      await resellNft(minterContract, index, price, performActions)

      getAssets();
    }
  }

  // funtion to buy nft
  // uses the token id(index) of the nft
  // to call the buyNft function imported
  // from the minter.js file
  async function buyAsset(tokenId) {
    const {index} = tokenId
    console.log(index)
    await buyNft(minterContract, index, performActions)

    getAssets();
  }
  
  useEffect(() => {
    try {
      if (address && minterContract) {
        getAssets();
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, address, getAssets]);

  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-4 fw-bold mb-0">{name}</h1>
              {address ? (
                <AddNfts save={addAsset} address={address} />
              ) : null}
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
              {nfts.map((_nft) => (
                <Nft
                  key={_nft.index}
                  nft={{
                    ..._nft,
                  }}
                  changeNftData={changeAsset}
                  buy={buyAsset}
                />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {
  minterContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  minterContract: null,
};

export default NftList;