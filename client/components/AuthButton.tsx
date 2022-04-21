import { ethers } from "ethers";
import { useState } from "react";

export default function AuthButton() {
    const SSR = typeof window === 'undefined'

    function connectWallet() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        provider.send('eth_requestAccounts', [])
            .catch(() => console.log('user rejected request'));
    }

    return (
        <div>
            {
                !SSR ? <button onClick={connectWallet} className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 p-5 mr-20 text-slate-200 w-full font-bold">Sign in with Ethereum</button> : null
            }
        </div>
        
    )
}