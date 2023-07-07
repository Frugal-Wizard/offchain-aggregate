// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Aggregator } from "../../contracts/Aggregator.sol";
import { IERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract NFTAggregator is Aggregator {
    constructor(IERC721Enumerable nft, address owner)
        onlyStaticCall
        Aggregator(abi.encode(_aggregateNFTs(nft, owner)))
    {
        // constructor should be empty, anything here won't be executed
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
