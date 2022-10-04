// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Classic Cars NFT Smart Contract
/// @author Charles Anyimode
/// @notice Mints a car image as an NFT and puts it up for sale
/// @dev A smart contract for uploading, minting, selling, buying and gifting NFTs

contract ClassicCars is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    IERC721Receiver
{
    using Counters for Counters.Counter;

    constructor() ERC721("ClassicCars", "CCNFT") {}

    // string private uri = "https://ipfs.io/ipfs/QmSw9o2dDbGSK8BGHB1yYZDCzBfAjKtv5DFebQadJUZb85/";

    Counters.Counter private _tokenIdCounter;

    struct Car {
        address payable owner;
        uint256 price;
        bool inMarket;
    }

    mapping(uint256 => Car) internal cars;

    modifier onlyCarOwner(uint256 tokenId) {
        require(
            msg.sender == cars[tokenId].owner,
            "Sorry, only car owner can gift car"
        );
        _;
    }

    modifier checkIfInMarket(uint256 tokenId) {
        require(cars[tokenId].inMarket, "Car is not in the marketplace");
        _;
    }

    modifier checkIfNotInMarket(uint256 tokenId) {
        require(!cars[tokenId].inMarket, "Car already in the marketplace");
        _;
    }

    modifier exists(uint256 tokenId) {
        require(_exists(tokenId), "Query of nonexistent car");
        _;
    }

    /// @notice Requests for car details like uri, price and stores these details
    /// @dev Takes the params as arguments and stores them in a car mapping using the index as a key
    /// @param uri IPFS link for metadata of car
    function uploadClassicCar(string calldata uri, uint256 _price) external {
        require(bytes(uri).length > 0, "Empty uri");
        require(_price > 0, "Price must be at least 1");
        bool _inMarket = true;
        uint256 _tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, uri);

        cars[_tokenId] = Car(payable(msg.sender), _price, _inMarket);
        _transfer(msg.sender, address(this), _tokenId);
    }

    /// @notice Get car, to get a particular car from the cars stored using its index
    /// @dev Uses the index as a param to get the car stored in the cars mapping with that particular index as key
    /// @param tokenId, index of the car corresponding to the key in the mapping
    /// @return car, with all the details it has been stored with
    function readClassicCars(uint256 tokenId)
        public
        view
        exists(tokenId)
        returns (Car memory)
    {
        return (cars[tokenId]);
    }

    /// @notice Buy the desired car NFT with a specified price
    /// @dev Uses the index of the stored car to purchase an uploaded car
    ///     requires that the following conditions are true
    ///     1. that the buyer is not the seller
    ///     2. that the particula car must be available in the market
    ///     3. that the value sent with the transaction matches the price
    ///     4. that the particular id requested is valid
    ///    it then transfers the NFT to the buyer, sends the car price to the seller, changes the owner of the NFT to the buyer
    /// @param tokenId, of the requested car
    function buyClassicCar(uint256 tokenId)
        external
        payable
        exists(tokenId)
        checkIfInMarket(tokenId)
    {
        Car storage currentCar = cars[tokenId];
        require(
            msg.sender != currentCar.owner,
            "Sorry, you can't buy your minted car"
        ); // the buyer must not be the owner
        require(
            msg.value == currentCar.price,
            "Please submit the asking car price in order to complete the purchase"
        ); // price of the NFT must be met
        address _owner = currentCar.owner;
        currentCar.owner = payable(msg.sender);
        currentCar.inMarket = false;

        _transfer(address(this), msg.sender, tokenId); //transfering ownership of the NFT to the buyer
        (bool success, ) = payable(_owner).call{value: msg.value}("");
        require(success, "Transfer failed");
    }

    /// @notice A function to gift a classic car NFT to another user
    /// @dev Takes in the param tokenId to find a particular car and the _receivers address
    ///     uses the safeTransferFrom function to transfer the NFT from the owner to the receiver
    ///     the receiver becomes the new owner of the NFT
    /// @param tokenId, id of the car to be gifted
    /// @param _receiver, the address of the receiver of the car gift
    function giftClassicCar(uint256 tokenId, address _receiver)
        public
        exists(tokenId)
        onlyCarOwner(tokenId)
        checkIfNotInMarket(tokenId)
    {
        require(
            _receiver != address(0),
            "Address zero is not a valid receiver address"
        );
        require(
            msg.sender != _receiver,
            "Sorry, but you can't gift yourself your car"
        );
        safeTransferFrom(msg.sender, _receiver, tokenId);
    }

    /// @dev Takes in the param _tokenId to find a particular car, _price for the new price
    ///     changes the price of the car to the new price,
    ///     the inMarket property is set to true
    /// @param tokenId, id of the car to be put on the market
    /// @param _price, mew price of the car to sold
    function resellClassicCar(uint256 tokenId, uint256 _price)
        external
        exists(tokenId)
        onlyCarOwner(tokenId)
        checkIfNotInMarket(tokenId)
    {
        cars[tokenId].inMarket = true;
        cars[tokenId].price = _price;
        _transfer(msg.sender, address(this), tokenId);
    }

    /// @dev Takes in the param _tokenId to find a particular car and unlist car from the market
    /// the inMarket property is set to false
    /// @param tokenId, id of the car to be unlisted
    function unListClassicCar(uint256 tokenId)
        external
        exists(tokenId)
        onlyCarOwner(tokenId)
        checkIfInMarket(tokenId)
    {
        cars[tokenId].inMarket = false;
        _transfer(address(this), msg.sender, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @dev See {IERC721-transferFrom}.
     * Changes is made to transferFrom to update the respective car struct
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        cars[tokenId].owner = payable(to);
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     * Changes is made to safeTransferFrom to update the respective car struct
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        cars[tokenId].owner = payable(to);
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
