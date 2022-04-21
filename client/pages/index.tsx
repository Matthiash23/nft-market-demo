import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
// import axios from 'axios'
import {NFT_CONTRACT_ADDRESS, MARKETPLACE_ADDRESS} from '../market.config'
import NFT from '../../out/Nft.sol/Longuniquename.json'
import Marketplace from '../../out/Market.sol/Market.json'
import AuthButton from '../components/AuthButton'

const Home: NextPage = () => {
  const [nfts, setNfts] = useState(new Array)
  const [loadingState, setLoadingState] = useState('not-loaded')
  // const [provider, setProvider] = useState(ethers.providers.Web3Provider)

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs(){
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT.abi, provider)
    const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, Marketplace.abi, provider)

    const data = await marketContract.getOpenListings()

    const listings = await Promise.all(data.map(async (l: any) => {
      // const tokenUri = await tokenContract.tokenURI(l.tokenId)
      // const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(l.price.toString(), 'ether')
      let listing = {
        price,
        tokenId: l.tokenId.toNumber(),
        seller: l.seller,
        owner: l.owner,
        image: "http://www.gettyimages.com/gi-resources/images/RoyaltyFree/Apr17Update/ColourSurge1.jpg",
        name: "exampleName" + (Math.random() * 100).toString(),
        description: "exampleDescription" + (Math.random() * 100).toString()
      }
      return listing
    }))
    setNfts(listings)
    setLoadingState('loaded')
  }

  async function purchaseListing(listing: any) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(MARKETPLACE_ADDRESS, Marketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    const price = ethers.utils.parseUnits(listing.price.toString(), 'ether')
    let transaction = await contract.createListing(NFT_CONTRACT_ADDRESS, listing.tokenId, price, {value: listingPrice})
    await transaction.wait()
    // const price = ethers.utils.parseUnits(listing.price.toString(), 'ether')
    // console.log(price)
    // let transaction = await contract.purchaseListing(NFT_CONTRACT_ADDRESS, listing.tokenId, {value: price})
    // await transaction.wait()

    // const tx = await contract.purchaseListing(NFT_CONTRACT_ADDRESS, listing.tokenId, {
    //   value: price
    // })
    // await tx.wait()

    loadNFTs()

  }

  if (loadingState === 'not-loaded') {
    return (
      <h1 className="px-20 py-10 text-3xl">Loading, please be patient</h1>
    )
  }
  if (!nfts.length) {
    return (
      <div>
        
        <h1 className="px-20 py-10 text-3xl">No NFTS found in market</h1>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>NFT marketplace demo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          NFT marketplace demo
        </h1>
        <AuthButton></AuthButton>
        <div className="px-4" style={{maxWidth: '1600px'}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">

                  <img src={nft.image} alt="nft image" />
                  <div className="p-4">
                    <p style={{height: '70px'}} className="test-2xl font-semibold">{nft.name}</p>
                    <div style={{height: '70px', overflow: 'hidden'}}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="test2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                    <button className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 py-2 px-12 text-slate-200 w-full font-bold" onClick={() => purchaseListing(nft)}>Purchase listing</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        
        

      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        All right reserved
      </footer>
    </div>
  )
}

export default Home
