import { ethers } from 'ethers';
import { getEthersProvider, getWeb3, setUpEthereumProvider, tearDownEthereumProvider } from './provider';
import { readFileSync } from 'fs';
import path from 'path';
import { expect } from 'chai';
import { getTestNFTAddress, setUpEthersTestNFT, setUpWeb3TestNFT, tearDownEthersTestNFT, tearDownWeb3TestNFT, testNFTSetup } from './testnft';

const abi = JSON.parse(readFileSync(path.resolve(__dirname, 'artifacts', 'test_contracts_NFTAggregator_sol_NFTAggregator.abi')).toString());
const bytecode = readFileSync(path.resolve(__dirname, 'artifacts', 'test_contracts_NFTAggregator_sol_NFTAggregator.bin')).toString();

describe('NFTAggregator', function() {
    beforeEach(setUpEthereumProvider);
    afterEach(tearDownEthereumProvider);

    describe('using ethers', function() {
        beforeEach(setUpEthersTestNFT);
        afterEach(tearDownEthersTestNFT);

        it('should return all tokens owned', async function() {
            const provider = getEthersProvider();
            const factory = new ethers.ContractFactory(abi, bytecode);
            const testNFT = getTestNFTAddress();
            for (const [owner, tokens] of Object.entries(testNFTSetup)) {
                expect(await provider.call(await factory.getDeployTransaction(testNFT, owner)))
                    .to.be.equal(ethers.AbiCoder.defaultAbiCoder().encode(['uint[]'], [tokens]));
            }
        });
    });

    describe('using web3', function() {
        beforeEach(setUpWeb3TestNFT);
        afterEach(tearDownWeb3TestNFT);

        it('should return all tokens owned', async function() {
            const web3 = getWeb3();
            const contract = new web3.eth.Contract(abi);
            const testNFT = getTestNFTAddress();
            for (const [owner, tokens] of Object.entries(testNFTSetup)) {
                expect(await web3.eth.call({
                    from: '0x0000000000000000000000000000000000000000',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data: contract.deploy({ data: bytecode, arguments: [testNFT, owner] as any }).encodeABI(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any))
                    .to.be.equal(web3.eth.abi.encodeParameter('uint[]', tokens));
            }
        });
    });
});
