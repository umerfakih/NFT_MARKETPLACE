const {expect} =require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("NFTMarketplace",function(){
  let deployer,addr1,addr2,nft,marketplace
  let feePercent = 1;
  let URI = "sample URI"
  
  beforeEach(async function(){
    const NFT = await ethers.getContractFactory("NFT")
    const Marketplace = await ethers.getContractFactory("Marketplace");
    [deployer ,addr1 , addr2] = await ethers.getSigners()
    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  })
  

  describe("Deployment",function(){
    it("should tract the name and symbol and nft id",async function(){
      expect(await nft.name())
      .to.equal("MYNFT");
      expect(await nft.symbol())
      .to.equal("MY");
    })

    it("should check the feeaccount and fee percent",async function(){
      expect(await marketplace.owner()).to.equal(deployer.address);
      expect(await marketplace.feepercent()).to.equal(feePercent);
    })
  })
  

  describe("Minting NFT",function(){
    it("should tract minting nft",async function(){
      await nft.mint(URI)
      expect(await nft.tokenCount()).to.equal(1)
      expect(await nft.balanceOf(deployer.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);

    })
    it("SHould check item count",async function(){
      expect(await marketplace.itemcount())
      .to.equal(0);
    })
  })

  describe("Create nft",function(){
    beforeEach(async function(){
      await nft.mint(URI);
      await nft.setApprovalForAll(marketplace.address,true);
    })

    it("should track newly created nft,transfer from owner to marketplace",async function(){
      await expect(marketplace.create(nft.address,1,toWei(1)))
      .to.emit(marketplace,"Create")
      .withArgs(
        1,
        nft.address,
        1,
        toWei(1),
        deployer.address
      )
      expect(await nft.ownerOf(1))
      .to.equal(marketplace.address);
      expect(await marketplace.itemcount())
      .to.equal(1)
      const item = await marketplace.items(1);
      expect(item.itemid).to.equal(1)
      expect(item.nft).to.equal(nft.address);
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(1))
      expect(item.seller).to.equal(deployer.address)
      expect(item.sold).to.equal(false)
    })
  })

  describe("buy nft",function(){
    let price = 2
    let fee = (feePercent/100)*price
    let totalPriceInWei
    beforeEach(async function(){
      await nft.mint(URI)
      await nft.setApprovalForAll(marketplace.address,true)
      await marketplace.create(nft.address,1,toWei(2))
    })
    it("should update item as sold, pay seller, transfer nft to buyer,charge fees and emit a Purchased event",async function(){
      const sellerInitialEthbal = await deployer.getBalance()
      totalPriceInWei = await marketplace.getTotalprice(1);
      await expect(marketplace.connect(addr1).buy(1,{value : totalPriceInWei}))
      .to.emit(marketplace,"Purchased")
      .withArgs(
        1,
        nft.address,
        1,
        toWei(price),
        deployer.address,
        addr1.address
      )
      expect((await marketplace.items(1)).sold).to.equal(true)
      expect(await nft.ownerOf(1)).to.equal(addr1.address); 
    })

    it("Should fail for invalid item ids,sold items and when not enough ether is paid",async function(){
      await expect(
        marketplace.connect(addr1).buy(2,{value:totalPriceInWei})
      ).to.be.revertedWith("item dosent exist")
      await expect(
        marketplace.connect(addr2).buy(0,{value:totalPriceInWei})
      ).to.be.revertedWith("itme dosent exist")
      await expect(
        marketplace.connect(addr1).buy(1,{value:toWei(price)})
      ).to.be.revertedWith("not enough ether to cover item price")
      await marketplace.connect(addr1).buy(1,{value:totalPriceInWei})
      await expect(
        marketplace.connect(deployer).buy(1,{value:totalPriceInWei})
      ).to.be.revertedWith("item already sold")
    })
  })

})
