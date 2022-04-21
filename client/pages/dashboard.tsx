
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import {NFT_CONTRACT_ADDRESS, MARKETPLACE_ADDRESS} from '../market.config'
import NFT from '../../out/Nft.sol/Longuniquename.json'
import Marketplace from '../../out/Market.sol/Market.json'

export default function Dashboard(){
    const [nfts, setNfts] = useState(new Array)
    const [sold, setSold] = useState(new Array)
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadNFTs()
      }, [])
    
    async function loadNFTs(){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const tokenContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT.abi, provider)
        const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, Marketplace.abi, provider)
        const data = await marketContract.getUserCreatedListings()

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

        const soldListings = listings.filter(l => l.sold)
        setNfts(listings)
        setSold(soldListings)
        setLoadingState("loaded")
    }

    if (loadingState === 'not-loaded') {
        return (
          <h1 className="px-20 py-10 text-3xl">Loading, please be patient</h1>
        )
    }

    if (!nfts.length) {
        return (
            <div>
            
            <h1 className="px-20 py-10 text-3xl">No NFTs owned</h1>
            </div>
        )
    }

    return (
        <div className="flex justify-center">
            <div className="px-4" style={{maxWidth: '1600px'}}>
                <h2 className="text-2xl py-2">Listings Created</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                    nfts.map((nft, i) => (
                        <div key={i} className="border shadow rounded-xl overflow-hidden">

                        <img src={nft.image} alt="nft image" className="rounded"/>
                        <div className="p-4">
                            <p style={{height: '70px'}} className="test-2xl font-semibold">{nft.name}</p>
                            <div style={{height: '70px', overflow: 'hidden'}}>
                            <p className="text-gray-400">{nft.description}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-black">
                            <p className="test2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                        </div>
                        </div>
                    ))
                    }
                </div>
            </div>
            {
                Boolean(sold.length) &&(
                    <div className="px-4" style={{maxWidth: '1600px'}}>
                        <h2 className="text-2xl py-2">Listings sold </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            {
                            sold.map((nft, i) => (
                                <div key={i} className="border shadow rounded-xl overflow-hidden">

                                <img src={nft.image} alt="nft image" className="rounded"/>
                                <div className="p-4">
                                    <p style={{height: '70px'}} className="test-2xl font-semibold">{nft.name}</p>
                                    <div style={{height: '70px', overflow: 'hidden'}}>
                                    <p className="text-gray-400">{nft.description}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-black">
                                    <p className="test2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                                </div>
                                </div>
                            ))
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}