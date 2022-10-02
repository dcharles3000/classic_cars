import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Button } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";
import Popup from "./Popup";
import { useContractKit } from "@celo-tools/use-contractkit";

const NftCard = ({ nft, changeNftData, buy }) => {
  const { image, description, owner, name, index, price, sold, market } = nft;
  const { kit } = useContractKit();
  const { defaultAccount } = kit;

  function cardButton(owner, contractAdd, sold, market, price) {
    if(owner === contractAdd) {
      if(market) { return <Popup save={nftData} name={`Gift ${price / 10**18}cUSD`} /> }
      else if (!market) {
        return <div className="d-flex justify-content-center gap-3"><Popup save={nftData} name={`Gift ${price / 10**18}cUSD`} /><Popup save={nftData} name="Resell" /></div>
      }
    }
    else if (owner !== contractAdd) {
      if(sold) { return <Button variant="primary" style={{ minWidth: "70px"}}>Sold</Button> }
      else if(!sold) { return <Button variant="primary" style={{ minWidth: "70px"}} onClick={()=> {buy({index})}}>Buy { price / 10**18 }cUSD</Button> }
    }
  }
  
  async function nftData(formData) {
    changeNftData({
      ...formData,
      index
    })
  }
  
  return (
    <>
    <Col key={index}>
      <Card className="h-100 position-relative">
        { sold && (owner !== defaultAccount) ? (
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "#ffffffd7", zIndex: "2", borderRadius: "inherit"}}
          >
          </div>
          ) : (
            ""
          )
        }
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {index} ID
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img src={image} alt={description} style={{ objectFit: "cover" }} />
        </div>

        <Card.Body className="d-flex flex-column text-center">
          <Card.Title className="text-capitalize">{name}</Card.Title>
          <Card.Text className="flex-grow-1 text-capitalize">{description}</Card.Text>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-center gap-3">
          { cardButton(owner, defaultAccount, sold, market, price) }
        </Card.Footer>
      </Card>
    </Col>
    </>
  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
};

export default NftCard;