import { getEthersProvider, getWeb3 } from './provider';
import { readFileSync } from 'fs';
import path from 'path';
import { ethers } from 'ethers';

const abi = JSON.parse(readFileSync(path.resolve(__dirname, 'artifacts', 'test_contracts_TestNFT_sol_TestNFT.abi')).toString());
const bytecode = readFileSync(path.resolve(__dirname, 'artifacts', 'test_contracts_TestNFT_sol_TestNFT.bin')).toString();

export const testNFTSetup: {
    readonly [address: string]: readonly bigint[];
} = {
    '0x1000000000000000000000000000000000000000': [
        1n,
        3n,
        7n,
    ],
    '0x1000000000000000000000000000000000000001': [
        2n,
        5n,
    ],
    '0x1000000000000000000000000000000000000002': [
        4n,
    ],
};

let testNFTAddress: string | undefined;

export function getTestNFTAddress(): string {
    if (!testNFTAddress) throw new Error('test NFT contract not deployed');
    return testNFTAddress;
}

export async function setUpEthersTestNFT() {
    const provider = getEthersProvider();
    const signer = await provider.getSigner();
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(Object.entries(testNFTSetup));
    await contract.waitForDeployment();
    testNFTAddress = await contract.getAddress();
}

export async function tearDownEthersTestNFT() {
    testNFTAddress = undefined;
}

export async function setUpWeb3TestNFT() {
    const web3 = getWeb3();
    const [ from ] = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .deploy({ data: bytecode, arguments: [Object.entries(testNFTSetup)] as any });
    const gas = (await contract.estimateGas({ from })).toString();
    testNFTAddress = (await contract.send({ from, gas })).options.address;
}

export async function tearDownWeb3TestNFT() {
    testNFTAddress = undefined;
}
