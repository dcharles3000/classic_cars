import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

const Cover = ({ name, connect }) => {
  if (name) {
    return (
      <div
        className="d-flex justify-content-center flex-column text-center "
        style={{
          backgroundImage: "url('https://cdn.wallpapersafari.com/50/9/e3DlRx.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          height: "100vh"
        }}
      >
        <div
          className="text-light position-absolute start-0 top-0 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(10px)",
            width: "40%"
          }}
        >
          <div className="px-5 text-start">
            <h1 className="mb-3">{name}</h1>
            <p>
              The reductive nature of this design is free from<br></br>
              superfluous detail, resulting in a form that has<br></br>
              breathtaking modernity. This is the most desirable<br></br>
              classic cars collection ever made
            </p>
            <Button
              onClick={() => connect().catch((e) => console.log(e))}
              variant="outline-light"
              className="px-3 mt-4"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

Cover.propTypes = {
  name: PropTypes.string,
};

Cover.defaultProps = {
  name: "",
};

export default Cover;
