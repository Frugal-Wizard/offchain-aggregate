# README

## What is this?

This is a solidity contract which can be used to read aggregate data (constructed using any arbitrary code) from a blockchain **without having to actually deploy the contract**.

For example, let's say you have an NFT contract that implements the Enumerable interface and you want to know all the NFTs owned by an address, you could iterate over each index and call `tokenOfOwnerByIndex()` for each index, which means you would make a request to your endpoint for each token.

This could be achieved with one request if there was a function that iterated over all index and compiled an array with all the tokens, but this means that function needs to be deployed somewhere for it to be called... except **it does not need to**.

Using the `Aggregator` contract you can write any view function you want and run it in a static call to obtain whatever data you want. Just keep in mind... it's a bit of hack (as in using stuff not the way it was intended to).

## How does this work?

The trick here is that when you deploy a contract you are actually running the code for the constructor, and you can static call a deploy transaction so it is technically possible to run arbitrary code in a static call.

The deploy code (constructor) returns the bytecode of the contract, which is what is returned if you static call a deploy transaction. But we can use assembly to hijack this and return whatever we want.

## How do I use this?

Best way to understand this is with an example, let's make the NFT aggregator we talked about before:

```solidity
contract NFTAggregator is Aggregator {
    constructor(IERC721Enumerable nft, address owner)
        onlyStaticCall
        Aggregator(abi.encode(_aggregateNFTs(nft, owner)))
    {
        // constructor should be empty, anything here won't be executed

        // the onlyStaticCall modifier is optional, it's just a safeguard
        // to prevent the contract from being mistakenly deployed
    }

    // contract should not have public/external functions
    // it would only increase the payload unnecessarily

    function _aggregateNFTs(IERC721Enumerable nft, address owner)
        private view
        returns (uint[] memory)
    {
        uint[] memory tokens = new uint[](nft.balanceOf(owner));
        for (uint i = 0; i < tokens.length; i++) {
            tokens[i] = nft.tokenOfOwnerByIndex(owner, i);
        }
        return tokens;
    }
}
```

And this is how we use it:

```javascript
// using Ethers 6.x

async function getNFTsOwnedBy(provider, nftAddress, ownerAddress) {
    const factory = new ethers.ContractFactory(
        NFT_AGGREGATOR_ABI, NFT_AGGREGATOR_BYTECODE
    );
    return ethers.AbiCoder.defaultAbiCoder().decode(
        [ 'uint[]' ],
        await provider.call(
            await factory.getDeployTransaction(nftAddress, ownerAddress)
        )
    )[0];
}
```

```javascript
// using web3 4.x

async function getNFTsOwnedBy(web3, nftAddress, ownerAddress) {
    const contract = new web3.eth.Contract(NFT_AGGREGATOR_ABI);
    return web3.eth.abi.decodeParameter(
        'uint[]',
        await web3.eth.call({
            from: '0x0000000000000000000000000000000000000000',
            data: contract.deploy({
                data: NFT_AGGREGATOR_BYTECODE,
                arguments: [nftAddress, ownerAddress],
            }).encodeABI(),
        })
    );
}
```
