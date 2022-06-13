// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

import "./structsSports/structGameMlb.sol";
import "./structsSports/structScoreMlb.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * @title Consumer contract of SportsDataIO
 * @notice Consumer of SportsDataIO data provider: https://market.link/data-providers/d66c1ec8-2504-4696-ab22-6825044049f7/integrations
 * sportsdataio-linkpool Adapter: https://market.link/adapters/6420d75c-3094-4cda-aaa0-8e7317f30f03/data-sources
 *
 */
contract SportsConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;
    using CBORChainlink for BufferChainlink.buffer;

    uint8 public constant MARKET_GAME_CREATE = 0;
    uint8 public constant MARKET_GAME_RESOLVE = 1;
    uint8 public constant LEAGUE_ID_MLB = 0; //The only supported at the moment of developement

    bytes32 private immutable jobId;
    uint256 private immutable fee;

    // keep all requested games indexed by id
    mapping(uint32 => GameMlb) public gamesById;

    event GameFound(uint32 indexed gameId, GameMlb game);
    event GameDuplicated(uint32 indexed gameId, GameMlb game);
    event ScoreFound(uint32 indexed gameId, ScoreMlb score);
    event Fulfillment(
        bytes32 requestId,
        bytes32[] result,
        uint256 datetime,
        uint256 size
    );

    error FailedTransferLINK(address to, uint256 amount);

    /**
     * @notice Initialize the link token and target oracle
     *
     * Network: Kovan
     * Link Token: 0xa36085F69e2889c224210F603D836748e7dC0088
     * Oracle: 0xfF07C97631Ff3bAb5e5e5660Cdf47AdEd8D4d4Fd
     * Job ID: bade3601c5ff496586d636c3995f06fe / 0x6261646533363031633566663439363538366436333663333939356630366665
     * Fee: 0.1 LINK
     */
    constructor() ConfirmedOwner(msg.sender) {
        // Sets the LINK token address for the detected public network
        // https://docs.chain.link/docs/chainlink-framework/
        //setPublicChainlinkToken();
        setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);
        setChainlinkOracle(0xfF07C97631Ff3bAb5e5e5660Cdf47AdEd8D4d4Fd);
        jobId = "bade3601c5ff496586d636c3995f06fe";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    /* ========== CONSUMER REQUEST FUNCTIONS ========== */

    /**
     * @notice Requests the tournament games either to be created or to be resolved on a specific date.
     * @dev Requests the 'schedule' endpoint. Result is an array of GameCreate or GameResolve encoded (see structs).
     * @param _leagueId the tournament ID.
     * @param _date the starting time of the event as a UNIX timestamp in seconds.
     */
    function requestGamesByDate(uint256 _leagueId, uint256 _date) external {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillGames.selector
        );

        req.addUint("market", MARKET_GAME_CREATE);
        req.addUint("leagueId", _leagueId);
        req.addUint("date", _date);

        sendChainlinkRequest(req, fee);
    }

    /**
     * @notice Requests the tournament games either to be created or to be resolved on a specific date.
     * @dev Requests the 'schedule' endpoint. Result is an array of GameCreate or GameResolve encoded (see structs).
     *
     * @param _leagueId the tournament ID.
     * @param _date the date to request events by, as a UNIX timestamp in seconds.
     * @param _gameIds the list of game IDs to filter
     */
    function requestScoreByGamesId(
        uint256 _leagueId,
        uint256 _date,
        uint256[] calldata _gameIds
    ) external {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillScores.selector
        );

        req.addUint("market", MARKET_GAME_RESOLVE);
        req.addUint("leagueId", _leagueId);
        req.addUint("date", _date);
        _addUintArray(req, "gameIds", _gameIds);

        sendChainlinkRequest(req, fee);
    }

    /* ========== CONSUMER FULFILL FUNCTIONS ========== */

    /**
     * @notice Stores the scheduled games.
     * @param _requestId the request ID for fulfillment.
     * @param _result the games either to be created or resolved.
     */
    function fulfillGames(bytes32 _requestId, bytes32[] memory _result)
        external
        recordChainlinkFulfillment(_requestId)
    {
        emit Fulfillment(_requestId, _result, block.timestamp, _result.length);
        // For each game, check if is already in the collection
        for (uint i = 0; i < _result.length; i++) {
            uint32 gameId = uint32(bytes4(_result[i]));
            //If startTime is zero, it means that the game is not in the collection
            if (gamesById[gameId].startTime == 0) {
                GameMlb memory game = getGameMlbStruct(_result[i]);
                gamesById[gameId] = game;
                emit GameFound(gameId, game);
            } else {
                emit GameDuplicated(gameId, gamesById[gameId]);
            }
        }
    }

    /**
     * @notice Update games with the score.
     * @param _requestId the request ID for fulfillment.
     * @param _result the games either to be created or resolved.
     */
    function fulfillScores(bytes32 _requestId, bytes32[] memory _result)
        external
        recordChainlinkFulfillment(_requestId)
    {
        // For each game, check if is already in the collection
        for (uint i = 0; i < _result.length; i++) {
            uint32 gameId = uint32(bytes4(_result[i]));
            //If startTime is different from zero, it means the game exists in the collection
            if (gamesById[gameId].startTime != 0) {
                ScoreMlb memory score = getScoreMlbStruct(_result[i]);
                gamesById[gameId].status = score.status;
                gamesById[gameId].homeScore = score.homeScore;
                gamesById[gameId].awayScore = score.awayScore;
                emit ScoreFound(gameId, score);
            }
        }
    }

    function getGameMlb(uint32 _gameId) external view returns (GameMlb memory) {
        return gamesById[_gameId];
    }

    function getGameMlbStruct(bytes32 _data)
        private
        pure
        returns (GameMlb memory)
    {
        GameMlb memory gameMlb = GameMlb(
            //[gameId] take the first 4 bytes (32 bits) of the _data
            uint32(bytes4(_data)),
            //[startTime] from a copy of _data which had 32 bits moved to the left, take the first 5 bytes (40 bits)
            uint40(bytes5(_data << 32)),
            //[homeTeam] from a copy of _data which had 72 bits moved to the left (32 + 40), take the first 10 bytes (80 bits)
            bytes10(_data << 72),
            //[awayTeam] from a copy of _data which had 152 bits moved to the left (32 + 40 + 80), take the first 10 bytes
            bytes10(_data << 152),
            //[homeScore]
            0,
            //[awayScore]
            0,
            //[status]
            0
        );
        return gameMlb;
    }

    function getScoreMlbStruct(bytes32 _data)
        private
        pure
        returns (ScoreMlb memory)
    {
        ScoreMlb memory score = ScoreMlb(
            //take the first 4 bytes (32 bits) of the _data
            uint32(bytes4(_data)),
            //from a copy of _data which had 32 bits moved to the left, take the first byte (8 bits)
            uint8(bytes1(_data << 32)),
            //from a copy of _data which had 40 bits moved to the left (32 + 8), take the first byte (8 bits)
            uint8(bytes1(_data << 40)),
            //from a copy of _data which had 48 bits moved to the left (32 + 8 + 8), take the first 20 bytes
            bytes20(_data << 48)
        );
        return score;
    }

    function _addUintArray(
        Chainlink.Request memory _req,
        string memory _key,
        uint256[] memory _values
    ) private pure {
        Chainlink.Request memory r2 = _req;
        r2.buf.encodeString(_key);
        r2.buf.startArray();
        uint256 valuesLength = _values.length;
        for (uint256 i = 0; i < valuesLength; ) {
            r2.buf.encodeUInt(_values[i]);
            unchecked {
                ++i;
            }
        }
        r2.buf.endSequence();
        _req = r2;
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        uint256 amount = link.balanceOf(address(this));
        if (link.transfer(msg.sender, amount) == false) {
            revert FailedTransferLINK(msg.sender, amount);
        }
    }
}
