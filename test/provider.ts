import { ethers } from 'ethers';
import ganache, { EthereumProvider } from 'ganache';
import levelup from 'levelup';
import memdown from 'memdown';
import { Web3 } from 'web3';

let provider: EthereumProvider | undefined;

export function getProvider(): EthereumProvider {
    if (!provider) throw new Error('provider not available');
    return provider;
}

export function getEthersProvider(): ethers.JsonRpcApiProvider {
    return new ethers.BrowserProvider(getProvider());
}

export function getWeb3(): Web3 {
    return new Web3(getProvider());
}

export async function setUpEthereumProvider() {
    provider = ganache.provider({
        logging: {
            quiet: true,
        },
        database: {
            db: levelup(memdown()),
        },
        accounts: [
            {
                secretKey: '0x0000000000000000000000000000000000000000000000000000000000000001',
                balance: '0x3635c9adc5dea00000',
            },
        ],
    });
}

export async function tearDownEthereumProvider() {
    provider = undefined;
}
