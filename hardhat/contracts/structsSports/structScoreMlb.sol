//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

struct ScoreMlb {
    //ID representing this unique game
    uint32 gameId;
    //representing the home team's score
    uint8 homeScore;
    //representing the away team's score
    uint8 awayScore;
    //status representing the status of the game, e.g. finished and notstarted
    bytes20 status;
}
