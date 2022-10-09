// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Classic Cars NFT Smart Contract
/// @author Charles Anyimode
/// @notice Mints a car image as an NFT and puts it up for sale
/// @dev A smart contract for uploading, minting, selling, buying and gifting NFTs

contract ClassicCars is ERC721, ERC721Enumerable, ERC721URIStorage, IERC721Receiver {
    using Counters for Counters.Counter;
    constructor() ERC721("ClassicCars", "CCNFT") {}
    
    // string private uri = "https://ipfs.io/ipfs/QmSw9o2dDbGSK8BGHB1yYZDCzBfAjKtv5DFebQadJUZb85/";

    Counters.Counter private _tokenIdCounter;

    struct Car {
        address payable owner;
        string name;
        string description;
        string image;
        uint256 tokenId;
        uint256 price;
        bool isSold;
        bool inMarket;
    }

    mapping(uint256 => Car) internal cars;

    modifier onlyOwner(uint256 _tokenId){
        require(msg.sender == cars[_tokenId].owner, "Only the owner can access the functionality");
        _;
    }

    modifier exists(uint256 _tokenId){
        require(_tokenId == cars[_tokenId].tokenId, "Car does not exist");    // Car must exist
        _;
    }

    modifier validPrice(uint256 _tokenId){
        require(_price > 0, "Price must be at least 1");
    }

/// @notice Takes in two parameters and uses them to mint an image uploaded as NFT
/// @dev Mint a car image as an NFT
/// @param _uri, the url of the image
    function safeMint(address to, string memory _uri) public {
        uint256 _tokenId = _tokenIdCounter.current();

        require(_tokenId == cars[_tokenId].tokenId, "Car not found");
        
        _safeMint(to, _tokenId);
        _setTokenURI(_tokenId, _uri);

        _tokenIdCounter.increment();
    }


/// @notice Requests for car details like name, description, price and stores these details
/// @dev Takes the params as arguments and stores them in a car mapping using the index as a key
/// @param _name, name of the car to be uploaded
/// @param _image, image of the car to be uploaded
/// @param _description, description of the car to be uploaded
/// @param _price, price of the car to be uploaded
    function uploadClassicCar(
        string memory _name,
        string memory _image,
        string memory _description,
        uint256 _price
    ) external validPrice(_price){

        bool _isSold = false;
        bool _inMarket = true;
        uint256 _length = totalSupply();
        uint256 _tokenId = _tokenIdCounter.current();

        cars[_length] =  Car(
            payable(msg.sender),
            _name,
            _description,
            _image,
            _tokenId,
            _price,
            _isSold,
            _inMarket
        );
        
    }

/// @notice Buy the desired NFT with a specified price
/// @dev Uses the index of the stored car to purchase an uploaded car
///     requires that the following conditions are true
///     1. that the buyer is not the seller
///     2. that the item requested has not been sold
///     3. that the price is valid
///     4. that the particular id requested is valid
///     5. that the particula car must be available in the market
///    it then transfers the NFT to the buyer, sends the car price to the seller, changes the owner of the NFT to the buyer
/// @param _tokenId, of the requested car
    function buyClassicCar(uint256 _tokenId) external payable {
        uint256 _price = cars[_tokenId].price; //assigning the NFT price to a variable
        bool _isSold = cars[_tokenId].isSold; // assign the sold value to a local variable
        bool _inMarket = cars[_tokenId].inMarket; // assign the inMarket value to a local variable

        require(msg.sender != cars[_tokenId].owner, "Can't buy your own car");    // the buyer must not be the owner
        require(_inMarket, "Classic car not up for sale"); // Car must be available in the market
        require(!_isSold, "Car already sold"); // check if the car has already been sold
        require(msg.value == _price, "Please submit the asking car price in order to complete the purchase"); // price of the NFT must be met

        address _owner = ownerOf(_tokenId);
        _transfer(_owner, msg.sender, _tokenId);    //transfering ownership of the NFT to the buyer
        
        cars[_tokenId].owner.transfer(msg.value);    //tranfering money to the seller of the NFT

        cars[_tokenId].owner = payable(msg.sender);  //changing the owner variable of the NFT to the buyer
        cars[_tokenId].isSold = true;
        cars[_tokenId].inMarket = false;
    }

    function changePrice(uint256 _tokenId) external exists(_tokenId) onlyOwner(_tokenId) validPrice(_price){
        cars[_tokenId].price = _price;
    }

    function takeCarOutOfMarket(uint256 _tokenId) exists(_tokenId) onlyOwner(_tokenId){
        cars[_tokenId].inMarket = false;
    }


/// @notice A function to gift a classic car NFT to another user
/// @dev Takes in the param _tokenId to find a particular car and the _receivers address
///     uses the safeTransferFrom function to transfer the NFT from the owner to the receiver
///     the receiver become the new owner ofn the NFT
/// @param _tokenId, id of the car to be gifted
/// @param _receiver, the address of the receiver of the car gift
    function giftClassicCar(uint256 _tokenId, address _receiver) external exists(_tokenId) onlyOwner(_tokenId){
        require(msg.sender != _receiver, "Can't gift Yourrself");

        if(_receiver != address(0)) {
            cars[_tokenId].owner = payable(_receiver);
            safeTransferFrom(msg.sender, _receiver, _tokenId);

            cars[_tokenId].isSold = true;
            cars[_tokenId].inMarket = false;
        }
    }


/// @dev Takes in the param _tokenId to find a particular car, _price for the new price
///     changes the price of the car to the new price,
///     the isSold property is set to false and the the inMarket property is set to true
/// @param _tokenId, id of the car to be gifted
/// @param _price, mew price of the car to sold
    function resellClassicCar(uint256 _tokenId, uint256 _price) external  onlyOwner(_tokenId) exists(_tokenId){
        require(!cars[_tokenId].inMarket, "Car already in the marketplace");
        cars[_tokenId].isSold = false;
        cars[_tokenId].inMarket = true;
        cars[_tokenId].price = _price;
    }


/// @dev Takes in the param _tokenId to find a particular car
/// @param _tokenId, id of the car to be gifted
/// @return bool, true if car is sold and false if car is not sold
    function isCarSold(uint256 _tokenId) external view returns(bool) {
        return cars[_tokenId].isSold;
    }


/// @dev Takes in the param _tokenId to find a particular car
/// @param _tokenId, id of the car to be gifted
/// @return bool, true if car is available in the market and false if car is not not available in the market
    function isCarInMarket(uint256 _tokenId) external view returns(bool) {
        return cars[_tokenId].inMarket;
    }

/// @notice Get car, to get a particular car from the cars stored using its index
/// @dev Uses the index as a param to get the car stored in the cars mapping with that particular index as key
/// @param _tokenId, index of the car corresponding to the key in the mapping
/// @return car, with all the details it has been stored with
    function readClassicCars(uint256 _tokenId) external view returns (
        address payable,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256
    ) {
        return (
            cars[_tokenId].owner,
            cars[_tokenId].name,
            cars[_tokenId].description,
            cars[_tokenId].image,
            cars[_tokenId].tokenId,
            cars[_tokenId].price
        );
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
    ) override external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
