//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

struct GameMlb {
    //ID representing this unique game
    uint32 gameId;
    // representing the UNIX timestamp for the start time of the game
    uint40 startTime;
    // representing the home team's name
    bytes10 homeTeam;
    // representing the away team's name
    bytes10 awayTeam;
    
    //representing the home team's score
    uint8 homeScore;
    //representing the away team's score
    uint8 awayScore;
    //status representing the status of the game, e.g. finished and notstarted
    bytes20 status;
}