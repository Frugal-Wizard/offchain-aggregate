// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract Aggregator {
    constructor(bytes memory result) {
        assembly {
            return(add(result, 32), mload(result))
        }
    }

    modifier onlyStaticCall() {
        require(msg.sender == address(0));
        _;
    }
}
