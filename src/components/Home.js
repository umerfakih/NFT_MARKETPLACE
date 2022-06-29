import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import {ethers} from 'ethers';

const Home = ({ marketplace, nft }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMarketplaceItems = async () => {
    const itemcount = await marketplace.itemcount()
    let items = []
    for (let i = 1; i <= itemcount; i++) {
      const item = await marketplace.items(1)
      if (!item.sold) {
        const uri = await nft.tokenURI(item.tokenId)
        const response = await fetch(uri)
        const metadata = await response.json()
        const totalprice = await marketplace.getTotalprice(item.itemid)
        items.push({
          totalprice,
          itemid: item.itemid,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        })
      }
    }
    setItems(items)
    setLoading(false)
  }

  const buy = async (item) => {
    await (
      await marketplace.buy(item.itemid, { value: item.totalprice })
    ).wait()
    loadMarketplaceItems()
  }
  useEffect(() => {
    loadMarketplaceItems()
  }, [])

  if (loading)
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    )

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button
                        onClick={() => buy(item)}
                        variant="primary"
                        size="lg"
                      >
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: '1rem 0' }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  )
}

export default Home
