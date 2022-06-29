// SPDX-Licence-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    address payable public immutable owner;
    uint public immutable feepercent;
    uint public itemcount;

    struct Item{
        uint itemid;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    event Create(
        uint itemid,
        address indexed nft,
        uint tokenID,
        uint price,
        address indexed seller
    );

    event Purchased(
        uint itemid,
        address indexed nft,
        uint tokenID,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    mapping(uint=>Item) public items;


    constructor(uint _feepercent){
        owner = payable(msg.sender);
        feepercent = _feepercent;
    }

    function create(IERC721 _nft,uint _tokenid ,uint _price) external onlyOwner nonReentrant{
    require(_price > 0 , "price should not be zero");
    itemcount ++;
    _nft.transferFrom(msg.sender, address(this), _tokenid);
    items[itemcount] = Item(
        itemcount,
        _nft,
        _tokenid,
        _price,
        payable(msg.sender),
        false 
    );

    emit Create(itemcount, address(_nft), _tokenid, _price, msg.sender);

    }


    function buy(uint _itemId) external payable nonReentrant{
        uint _totalprice = getTotalprice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemcount,"item dosent exist");
        require(msg.value >= _totalprice);
        require(!item.sold,"item already sold");
        item.seller.transfer(item.price);
        owner.transfer(_totalprice - item.price);
        item.sold = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        emit Purchased(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );

    }

    function getTotalprice(uint _itemId) view public returns(uint){
       return((items[_itemId].price*(100 + feepercent))/100);
    }

    modifier onlyOwner{
    require(msg.sender == owner,"you are not  owner");
     _;

}
}