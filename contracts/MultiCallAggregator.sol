// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Aggregator } from './Aggregator.sol';

contract MultiCallAggregator is Aggregator {
    struct Call {
        address target;
        bytes payload;
    }

    struct Result {
        bool success;
        bytes data;
    }

    constructor(Call[] memory calls)
        Aggregator(abi.encode(_multicall(calls)))
    {}

    function _multicall(Call[] memory calls) private view returns (Result[] memory) {
        Result[] memory results = new Result[](calls.length);

        for (uint i = 0; i < calls.length; i++) {
            Call memory call = calls[i];
            (bool success, bytes memory data) = call.target.staticcall(call.payload);
            results[i] = Result(success, data);
        }

        return results;
    }
}
