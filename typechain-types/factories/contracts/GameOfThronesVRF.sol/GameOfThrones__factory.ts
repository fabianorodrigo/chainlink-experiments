/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  GameOfThrones,
  GameOfThronesInterface,
} from "../../../contracts/GameOfThronesVRF.sol/GameOfThrones";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subscriptionId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "_vrfCoordinator",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address",
      },
      {
        internalType: "address",
        name: "want",
        type: "address",
      },
    ],
    name: "OnlyCoordinatorCanFulfill",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    name: "DiceLanded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "roller",
        type: "address",
      },
    ],
    name: "DiceRolled",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "house",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "randomWords",
        type: "uint256[]",
      },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "roller",
        type: "address",
      },
    ],
    name: "rollDice",
    outputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60a0604052737a1bac17ccc5b313516c5e16fb24f7659aa5ebed600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f60001b600255619c40600360006101000a81548163ffffffff021916908363ffffffff16021790555060038060046101000a81548161ffff021916908361ffff1602179055506001600360066101000a81548163ffffffff021916908363ffffffff160217905550348015620000ef57600080fd5b50604051620015d9380380620015d983398181016040528101906200011591906200022e565b808073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1660601b8152505050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550336003600a6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600060146101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055505050620002f6565b6000815190506200021181620002c2565b92915050565b6000815190506200022881620002dc565b92915050565b60008060408385031215620002485762000247620002bd565b5b6000620002588582860162000217565b92505060206200026b8582860162000200565b9150509250929050565b6000620002828262000289565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600067ffffffffffffffff82169050919050565b600080fd5b620002cd8162000275565b8114620002d957600080fd5b50565b620002e781620002a9565b8114620002f357600080fd5b50565b60805160601c6112be6200031b6000396000818160c4015261011801526112be6000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80631fe543e314610046578063b1cad5e314610062578063dd02d9e514610092575b600080fd5b610060600480360381019061005b9190610c89565b6100c2565b005b61007c60048036038101906100779190610c2f565b610182565b6040516100899190610e5d565b60405180910390f35b6100ac60048036038101906100a79190610c2f565b6102d9565b6040516100b99190610edf565b60405180910390f35b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461017457337f00000000000000000000000000000000000000000000000000000000000000006040517f1cf993f400000000000000000000000000000000000000000000000000000000815260040161016b929190610de1565b60405180910390fd5b61017e8282610598565b5050565b60606000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541415610207576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101fe90610e9f565b60405180910390fd5b602a600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054141561028a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161028190610e7f565b60405180910390fd5b6102d2600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461067a565b9050919050565b60006003600a9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461033557600080fd5b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054146103b7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103ae90610ebf565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16635d3b1d30600254600060149054906101000a900467ffffffffffffffff16600360049054906101000a900461ffff16600360009054906101000a900463ffffffff16600360069054906101000a900463ffffffff166040518663ffffffff1660e01b8152600401610464959493929190610e0a565b602060405180830381600087803b15801561047e57600080fd5b505af1158015610492573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104b69190610c5c565b9050816004600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550602a600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16817f3e7fdeab84c01ce5308321caa0b460e1c4ec3c7099223d79634d9a71d99932e360405160405180910390a3919050565b600060016014836000815181106105b2576105b161115c565b5b60200260200101516105c491906110cd565b6105ce9190610f67565b905080600560006004600087815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080837f54d97c1f7e5abad75bd421455cd4dd296852a52e1ea721f2cdb66d06fa2082a960405160405180910390a3505050565b606060006040518061028001604052806040518060400160405280600981526020017f54617267617279656e000000000000000000000000000000000000000000000081525081526020016040518060400160405280600981526020017f4c616e6e6973746572000000000000000000000000000000000000000000000081525081526020016040518060400160405280600581526020017f537461726b00000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600681526020017f547972656c6c000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600981526020017f426172617468656f6e000000000000000000000000000000000000000000000081525081526020016040518060400160405280600781526020017f4d617274656c6c0000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600581526020017f54756c6c7900000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600681526020017f426f6c746f6e000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600781526020017f477265796a6f790000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600581526020017f417272796e00000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600481526020017f467265790000000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600781526020017f4d6f726d6f6e740000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600681526020017f5461726c6579000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600581526020017f4461796e6500000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600581526020017f556d62657200000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600881526020017f56616c6572796f6e00000000000000000000000000000000000000000000000081525081526020016040518060400160405280600881526020017f4d616e6465726c7900000000000000000000000000000000000000000000000081525081526020016040518060400160405280600781526020017f436c6567616e650000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600681526020017f476c6f766572000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600881526020017f4b6172737461726b000000000000000000000000000000000000000000000000815250815250905080600184610b349190610fbd565b60148110610b4557610b4461115c565b5b6020020151915050919050565b6000610b65610b6084610f1f565b610efa565b90508083825260208201905082856020860282011115610b8857610b876111bf565b5b60005b85811015610bb85781610b9e8882610c05565b845260208401935060208301925050600181019050610b8b565b5050509392505050565b600081359050610bd18161125a565b92915050565b600082601f830112610bec57610beb6111ba565b5b8135610bfc848260208601610b52565b91505092915050565b600081359050610c1481611271565b92915050565b600081519050610c2981611271565b92915050565b600060208284031215610c4557610c446111c9565b5b6000610c5384828501610bc2565b91505092915050565b600060208284031215610c7257610c716111c9565b5b6000610c8084828501610c1a565b91505092915050565b60008060408385031215610ca057610c9f6111c9565b5b6000610cae85828601610c05565b925050602083013567ffffffffffffffff811115610ccf57610cce6111c4565b5b610cdb85828601610bd7565b9150509250929050565b610cee81610ff1565b82525050565b610cfd81611003565b82525050565b6000610d0e82610f4b565b610d188185610f56565b9350610d28818560208601611069565b610d31816111ce565b840191505092915050565b6000610d49601083610f56565b9150610d54826111df565b602082019050919050565b6000610d6c600f83610f56565b9150610d7782611208565b602082019050919050565b6000610d8f600e83610f56565b9150610d9a82611231565b602082019050919050565b610dae8161100d565b82525050565b610dbd8161103b565b82525050565b610dcc81611045565b82525050565b610ddb81611055565b82525050565b6000604082019050610df66000830185610ce5565b610e036020830184610ce5565b9392505050565b600060a082019050610e1f6000830188610cf4565b610e2c6020830187610dd2565b610e396040830186610da5565b610e466060830185610dc3565b610e536080830184610dc3565b9695505050505050565b60006020820190508181036000830152610e778184610d03565b905092915050565b60006020820190508181036000830152610e9881610d3c565b9050919050565b60006020820190508181036000830152610eb881610d5f565b9050919050565b60006020820190508181036000830152610ed881610d82565b9050919050565b6000602082019050610ef46000830184610db4565b92915050565b6000610f04610f15565b9050610f10828261109c565b919050565b6000604051905090565b600067ffffffffffffffff821115610f3a57610f3961118b565b5b602082029050602081019050919050565b600081519050919050565b600082825260208201905092915050565b6000610f728261103b565b9150610f7d8361103b565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610fb257610fb16110fe565b5b828201905092915050565b6000610fc88261103b565b9150610fd38361103b565b925082821015610fe657610fe56110fe565b5b828203905092915050565b6000610ffc8261101b565b9050919050565b6000819050919050565b600061ffff82169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600063ffffffff82169050919050565b600067ffffffffffffffff82169050919050565b60005b8381101561108757808201518184015260208101905061106c565b83811115611096576000848401525b50505050565b6110a5826111ce565b810181811067ffffffffffffffff821117156110c4576110c361118b565b5b80604052505050565b60006110d88261103b565b91506110e38361103b565b9250826110f3576110f261112d565b5b828206905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f526f6c6c20696e2070726f677265737300000000000000000000000000000000600082015250565b7f44696365206e6f7420726f6c6c65640000000000000000000000000000000000600082015250565b7f416c726561647920726f6c6c6564000000000000000000000000000000000000600082015250565b61126381610ff1565b811461126e57600080fd5b50565b61127a8161103b565b811461128557600080fd5b5056fea2646970667358221220c4a3124dacb2b515d8286c2f9653a43e341b7352de9f539b2636fb6b97f8388064736f6c63430008070033";

type GameOfThronesConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GameOfThronesConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GameOfThrones__factory extends ContractFactory {
  constructor(...args: GameOfThronesConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _subscriptionId: BigNumberish,
    _vrfCoordinator: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<GameOfThrones> {
    return super.deploy(
      _subscriptionId,
      _vrfCoordinator,
      overrides || {}
    ) as Promise<GameOfThrones>;
  }
  override getDeployTransaction(
    _subscriptionId: BigNumberish,
    _vrfCoordinator: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _subscriptionId,
      _vrfCoordinator,
      overrides || {}
    );
  }
  override attach(address: string): GameOfThrones {
    return super.attach(address) as GameOfThrones;
  }
  override connect(signer: Signer): GameOfThrones__factory {
    return super.connect(signer) as GameOfThrones__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GameOfThronesInterface {
    return new utils.Interface(_abi) as GameOfThronesInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GameOfThrones {
    return new Contract(address, _abi, signerOrProvider) as GameOfThrones;
  }
}
