import { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";

import {NFT_CONTRACT_ADDRESS, MARKETPLACE_ADDRESS} from '../market.config'
import NFT from '../../out/Nft.sol/Longuniquename.json'
import Marketplace from '../../out/Market.sol/Market.json'

export default function CreateListing() {
    const [formInput, updateFormInput] = useState({price: '', name: '', description: ''})
    const router = useRouter()

    async function createSale() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        let contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT.abi, signer)
        let transaction = await contract.mintToken("https://demotokenurl.com")
        let tx = await transaction.wait()

        let event = tx.events[0]
        let value = event.args[2]
        console.log(formInput.price)
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, "ether")
        contract = new ethers.Contract(MARKETPLACE_ADDRESS, Marketplace.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.createListing(NFT_CONTRACT_ADDRESS, tokenId, price, {value: listingPrice})
        await transaction.wait()
        router.push('/')
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input type="text" placeholder="Name" className="mt-8 border rounded p-4" onChange={e => updateFormInput({...formInput, name: e.target.value})} />
                <textarea placeholder="Description" className="mt-8 border rounded p-4" onChange={e => updateFormInput({...formInput, description: e.target.value})} />
                <input placeholder="Price" className="mt-8 border rounded p-4" onChange={e => updateFormInput({...formInput, price: e.target.value})} />
                <br />
                <button onClick={createSale}>Create Listing</button>
            </div>
        </div>
    )
}