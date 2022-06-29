import './App.css'
import { ethers } from 'ethers'
import { useState } from 'react'
import NFTABI from './contractsData/NFT.json'
import NFTAddress from './contractsData/NFT-address.json'
import MarketplaceABI from './contractsData/Marketplace.json'
import MarketplaceAddress from './contractsData/Marketplace-address.json'
import Navigation from './components/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Create from './components/Create'
import MyListedItems from './components/Mylisted'
import MyPurchases from './components/MyPurchases'
import { Spinner } from 'react-bootstrap'

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [marketplace, setMarketplace] = useState({})
  const [nft, setNft] = useState({})

  const web3handler = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    setAccount(accounts[0])

    const signer = provider.getSigner()

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3handler()
    })

    loadblockchain(signer)
  }

  const loadblockchain = async (signer) => {
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceABI.abi,
      signer,
    )
    setMarketplace(marketplace)

    const nft = new ethers.Contract(NFTAddress.address, NFTABI.abi, signer)
    setNft(nft)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <Navigation web3handler={web3handler} account={account} />
      <div>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh',
            }}
          >
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Home marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/create"
              element={<Create marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/my-listed-items"
              element={
                <MyListedItems marketplace={marketplace} nft={nft} account={account} />
              }
            />
            <Route path="/my-purchases" element={<MyPurchases marketplace={marketplace} nft={nft} account={account} />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
