// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Chainlink maintains a library of contracts (https://github.com/smartcontractkit/chainlink/tree/master/contracts)
// that make consuming data from oracles easier. For Chainlink VRF, you will use:
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "hardhat/console.sol";

/// @notice The contract will request randomness from Chainlink VRF.
/// The result of the randomness will transform into a number between 1 and 20,
/// mimicking the rolling of a 20 sided die. Each number represents a Game of
/// Thrones house. If the dice land on the value 1, the user is assigned house
/// Targaryan, 2 for Lannister, and so on.
contract GameOfThrones is VRFConsumerBaseV2 {
  uint256 private constant ROLL_IN_PROGRESS = 42;

  VRFCoordinatorV2Interface COORDINATOR;

  // Your subscription ID.
  // ID da subscrição que este contrato utiliza para financiar os requests
  uint64 s_subscriptionId;

  // Rinkeby coordinator. For other networks,
  //address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;

  // Mumbai coordinator. For other networks,see https://docs.chain.link/docs/vrf-contracts/#configurations
  // Endereço do contrato da Chainlink VRF Coordinator
  address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

  // The gas lane to use, which specifies the maximum gas price to bump to.
  // For a list of available gas lanes on each network,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  // RYNKBY
  //bytes32 s_keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
  // O valor da chave hash da pista de gas, que é o preço máximo do gás que você está disposto a
  // pagar por uma solicitação em wei. Ele funciona como um ID do trabalho VRF off-chain que é
  // executado em resposta a solicitações.
  //MUMBAI
  bytes32 s_keyHash =
    0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

  // Depends on the number of requested values that you want sent to the
  // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
  // so 40,000 is a safe default for this example contract. Test and adjust
  // this limit based on the network that you select, the size of the request,
  // and the processing of the callback request in the fulfillRandomWords()
  // function.
  // O limite de quanto gas usar para a solicitação de retorno de chamada para a função fulfillRandomWords do seu contrato.
  // Deve ser menor que o maxGasLimit no contrato do coordenador. Ajuste esse valor conforme sua função fulfillmentRandomWords
  // processa e armazena os valores aleatórios recebidos. Se não for suficiente, o callback falhará
  uint32 callbackGasLimit = 40000;

  // The default is 3, but you can set this higher.
  // Estabelece quanas confirmações os nós da Chainlink deve esperar antes de responder
  // Quanto maior, mais seguro será o número randômico
  uint16 requestConfirmations = 3;

  // For this example, retrieve 1 random value in one request.
  // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
  // Quantos valores randômicos a serem requisitados. Pode-se solicitar mais de um valor em uma única requisição
  uint32 numWords = 1;

  address s_owner;

  // map rollers to requestIds
  // Guarda a relação entre o ID da requisição (recebido quando a requisição é feita) e o endereço
  // de quem jogou o dado. Desta forma, será possível identificar a qual jogador associar o resultado
  // quando o número randômico for enviado para a fulfillRandomWords
  mapping(uint256 => address) private s_rollers;
  // map vrf results to rollers
  // associa o jogador ao número tirado no dado, isto é, o número da casa
  mapping(address => uint256) private s_results;

  event DiceRolled(uint256 indexed requestId, address indexed roller);
  event DiceLanded(uint256 indexed requestId, uint256 indexed result);

  /**
   * @notice Constructor inherits VRFConsumerBaseV2
   *
   * @dev NETWORK: MUMBAI
   *
   * @param _subscriptionId subscription id that this consumer contract can use
   */
  constructor(uint64 _subscriptionId, address _vrfCoordinator)
    VRFConsumerBaseV2(_vrfCoordinator)
  {
    COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
    s_owner = msg.sender;
    s_subscriptionId = _subscriptionId;
  }

  /**
   * @notice Requests randomness
   * @dev Warning: if the VRF response is delayed, avoid calling requestRandomness repeatedly
   * as that would give miners/VRF operators latitude about which VRF response arrives first.
   * @dev You must review your implementation details with extreme care.
   *
   * @param roller address of the roller
   */
  function rollDice(address roller)
    public
    onlyOwner
    returns (uint256 requestId)
  {
    // checar se já foi lançado o dado para o jogador, já que cada um só pode estar associado a uma casa
    require(s_results[roller] == 0, "Already rolled");
    // Will revert if subscription is not set and funded.
    requestId = COORDINATOR.requestRandomWords(
      s_keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
    // armazena o ID do request associando-o ao jogador
    s_rollers[requestId] = roller;
    s_results[roller] = ROLL_IN_PROGRESS;
    emit DiceRolled(requestId, roller);
  }

  /**
   * @notice Callback function used by VRF Coordinator to return the random number to this contract.
   *
   * @dev Some action on the contract state should be taken here, like storing the result.
   * @dev WARNING: take care to avoid having multiple VRF requests in flight if their order of arrival would result
   * in contract states with different outcomes. Otherwise miners or the VRF operator would could take advantage
   * by controlling the order.
   * @dev The VRF Coordinator will only send this function verified responses, and the parent VRFConsumerBaseV2
   * contract ensures that this method only receives randomness from the designated VRFCoordinator.
   *
   * @param requestId uint256
   * @param randomWords  uint256[] The random result returned by the oracle.
   */
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal
    override
  {
    // transform the result to a number between 1 and 20 inclusively
    uint256 d20Value = (randomWords[0] % 20) + 1;
    // assign the transformed value to the address in the s_results mapping variable
    s_results[s_rollers[requestId]] = d20Value;
    // emitting event to signal that dice landed
    emit DiceLanded(requestId, d20Value);
  }

  /**
   * @notice Get the house assigned to the player once the address has rolled
   * @param player address
   * @return house as a string
   */
  function house(address player) public view returns (string memory) {
    // dice has not yet been rolled to this address
    require(s_results[player] != 0, "Dice not rolled");
    // not waiting for the result of a thrown dice
    require(s_results[player] != ROLL_IN_PROGRESS, "Roll in progress");
    // returns the house name from the name list function
    return getHouseName(s_results[player]);
  }

  /**
   * @notice Get the house namne from the id
   * @param id uint256
   * @return house name string
   */
  function getHouseName(uint256 id) private pure returns (string memory) {
    string[20] memory houseNames = [
      "Targaryen",
      "Lannister",
      "Stark",
      "Tyrell",
      "Baratheon",
      "Martell",
      "Tully",
      "Bolton",
      "Greyjoy",
      "Arryn",
      "Frey",
      "Mormont",
      "Tarley",
      "Dayne",
      "Umber",
      "Valeryon",
      "Manderly",
      "Clegane",
      "Glover",
      "Karstark"
    ];
    return houseNames[id - 1];
  }

  modifier onlyOwner() {
    require(msg.sender == s_owner);
    _;
  }
}
