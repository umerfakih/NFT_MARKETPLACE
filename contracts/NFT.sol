// SPDX-Licence-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721URIStorage {
    uint public tokenCount;
    address public owner;
    
    constructor() ERC721("MYNFT","MY") {
        owner = msg.sender;
    }

    function mint(string memory _tokenURI) external onlyOwner returns(uint){
        tokenCount++;
        _safeMint(msg.sender,tokenCount);
        _setTokenURI(tokenCount,_tokenURI);
        return(tokenCount);
    }

    modifier onlyOwner{
        require(msg.sender == owner,"you are not a owner");
        _;
    }
  
}