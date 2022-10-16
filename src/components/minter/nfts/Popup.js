import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form } from "react-bootstrap";

const Popup = ({ save, name }) => {
  const [data, setData] = useState("");
  const [show, setShow] = useState(false);

  // check if all form data has been filled
  const isFormFilled = () => data
  
  // close the popup modal
  const handleClose = () => {
    setShow(false);
  };
  
    // display the popup modal
  const handleShow = () => setShow(true);

  function popupName() {
    if(name.includes("Gift")) return "Gift";
    else if (name.includes("Resell")) return "Resell";
  }

  return (
    <>
      <Button
        onClick={handleShow}
        variant="primary"
        style={{ minWidth: "70px"}}
      >
        {name}
      </Button>

        {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{popupName()} Classic Car NFT</Modal.Title>
        </Modal.Header>
  
        <Modal.Body>
          <Form>
            <Form.Control
              type="text"
              placeholder={popupName()}
              style={{ height: "45px" }}
              onChange={(e) => {
                setData(e.target.value);
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
              const name = popupName()
              save({
                data,
                name
              });
              handleClose();
            }}
          >
            {popupName()} NFT
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

Popup.propTypes = {
  save: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};
  
export default Popup;