// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract TestNFT is ERC721, ERC721Enumerable {
    struct AddressAndTokens {
        address owner;
        uint[] tokens;
    }

    constructor(AddressAndTokens[] memory init)
        ERC721("Test NFT", "TEST")
    {
        for (uint i = 0; i < init.length; i++) {
            for (uint j = 0; j < init[i].tokens.length; j++) {
                _mint(init[i].owner, init[i].tokens[j]);
            }
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
