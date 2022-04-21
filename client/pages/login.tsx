import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

function Login(){
    const SSR = typeof window === 'undefined'

    // const origin = window.location.origin;
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();

    

    function createSiweMessage(address, statement) {
        const domain = window.location.host;
        const origin = window.location.origin;

        const message = new SiweMessage({
            domain,
            address,
            statement,
            uri: origin,
            version: '1',
            chainId: 1
        });
        return message.prepareMessage();
    }
    
    function connectWallet() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        provider.send('eth_requestAccounts', [])
            .catch(() => console.log('user rejected request'));
    }
    
    async function signInWithEthereum() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const message = createSiweMessage(
            await signer.getAddress(),
            'Sign in with Ethereum to the app.'
        );
        console.log(await signer.signMessage(message));
    }

    return (
        <div>
        { 
            !SSR ? <div><div><button onClick={connectWallet}>Connect wallet</button></div><div><button onClick={signInWithEthereum}>Sign-in with Ethereum</button></div></div> : null
        }
        </div>
    )
}
export default Login