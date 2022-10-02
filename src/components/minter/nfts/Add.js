import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form } from "react-bootstrap";
import { uploadFileToWebStorage } from "../../../utils/minter";

const AddNfts = ({ save, address }) => {
  const [name, setName] = useState("");
  const [ipfsImage, setIpfsImage] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [show, setShow] = useState(false);

  // check if all form data has been filled
  const isFormFilled = () =>
  name && ipfsImage && description && price;
  
  // close the popup modal
  const handleClose = () => {
    setShow(false);
  };
  
    // display the popup modal
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi bi-plus"></i>
      </Button>

        {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Classic Car NFT</Modal.Title>
        </Modal.Header>
  
        <Modal.Body>
          <Form>
            <Form.Control
              type="text"
              className="mb-3"
              placeholder="Name"
              style={{ height: "45px" }}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            
            <Form.Control
              as="textarea"
              className="mb-3"
              placeholder="Description"
              style={{ height: "80px" }}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
  
            <Form.Control
              type="file"
              className={"mb-3"}
              onChange={async (e) => {
                console.log(e)
                const imageUrl = await uploadFileToWebStorage(e);
                console.log(`Image URL: ${imageUrl}`)
                if (!imageUrl) {
                  alert("failed to upload image");
                  return;
                }
                setIpfsImage(imageUrl);
              }}
              placeholder="Product name"
            />

            <Form.Control
              type="number"
              placeholder="Price"
              style={{ height: "45px" }}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
            />
          </Form>
        </Modal.Body>
  
        <Modal.Footer>
          <Button variant="outline-primary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                ipfsImage,
                description,
                ownerAddress: address,
                price
              });
              handleClose();
            }}
          >
            Create NFT
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddNfts.propTypes = {
  save: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
};
  
export default AddNfts;