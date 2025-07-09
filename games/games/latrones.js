"use strict";

export class latronesInstance {
    constructor() {
        this.game = "latrones";
        this.playerIsJumping = false,
        this.phase = "placement",
        this.pieces = 0,
        this.turnColors = ["#000000", "#ffffff"],
        this.board = [
            [ false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false ] ];
    }

    endMessage() {
        return  [   `<@${this.player}>'s turn.${this.playerIsJumping ? "\n\nYou are in a multijump.\nYou can either continue your turn by jumping more pieces with the piece highlighted in green or end you turn by saying \"stop\"." : ''}`,
                    `<@${this.players[this.winner]}> has won by capturing enough of their opponent's pieces!`,
                    `<@${this.players[this.winner]}> has won because their opponent cannot make a legal move!`][this.end];
    }

    checkPiece(coord, type, trapped) {
        if (coord[0] < 0 || coord[1] < 0 || coord[0] > 7 || coord[1] > 7)
        {
            return type == 4;
        }

        if (typeof this.board[coord[0]][coord[1]] == "boolean" && type == 3 && !trapped)
        {
            return true;
        }

        if (typeof this.board[coord[0]][coord[1]] == "number" && type == this.board[coord[0]][coord[1]] && !trapped)
        {
            return true;
        }

        if (typeof this.board[coord[0]][coord[1]] == "object" && type == this.board[coord[0]][coord[1]][0] && trapped)
        {
            return true;
        }

        return false;
    }

    getNewCoords(coordinates, direction, distance) {
        coordinates.x += [0, 1, 0, -1][direction] * distance;
        coordinates.y += [-1, 0, 1, 0][direction] * distance;
        return coordinates;
    }

    playerTurn(playerInput) {
        this.highlight = [];
        this.winner = false;
        this.end = false;

        if (this.phase == "placement")
        {
            if (/^([1-8][a-h]|[a-h][1-8])$/i.test(playerInput))
            {
                let placement = {
                    x: parseInt(playerInput.match(/[a-j]/i)[0].toLowerCase(), 36) - 1,
                    y: playerInput.match(/[1-8]{1}/)[0] - 1,
                    trapped: false };

                if (!this.checkPiece(placement, 3))
                {
                    return "That space is not vacant.";
                }

                this.board[placement.y][placement.x] = this.turn;
                this.turn = this.turn == 1 ? 2 : 1;
                this.player = this.players[this.turn];
                this.pieces++;

                if (this.pieces == 32)
                {
                    this.phase = "movement";
                }

                this.highlight.push(placement);
            }

            if (/(up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(playerInput))
            {
                return "You cannot move pieces yet.";
            }

            if (/(remove|capture|cap|delete)$/i.test(playerInput))
            {
                return "You cannot capture pieces yet.";
            }

            if (/^(end|stop)$/i.test(playerInput))
            {
                return "You have to take your turn. Otherwise, just say \"x!latrones forfeit\".";
            }

            this.replay.push(playerInput);

            return false;
        }

        if (/^(([1-8][a-h]|[a-h][1-8]) |)(up|right|down|left|north|east|south|west|[urdlnesw])$/i.test(playerInput))
        {
            let moveOrigin = this.playerIsJumping ? this.playerIsJumping[0] : { x: parseInt(playerInput.match(/[a-j]/i)[0].toLowerCase(), 36) - 1, y: playerInput.match(/[1-8]{1}/)[0] - 1 };
            let moveDirection = {
                "up":    0, "right": 1, "down":  2, "left": 3,
                "u":     0, "r":     1, "d":     2, "l":    3,
                "north": 0, "east":  1, "south": 2, "west": 3,
                "n":     0, "e":     1, "s":     2, "w":    3
            }[playerInput.match(/(up|right|down|left|north|east|south|west|[urdlnesw])$/i)[0]];

            if (!/^([1-8][a-h]|[a-h][1-8])/i.test(playerInput) && !this.playerIsJumping && /^(up|right|down|left|north|east|south|west|[urdlnesw])$/i.test(playerInput))
            {
                return "Please specify which piece you want to move in that direction.";
            }

            if (this.playerIsJumping)
            {
                let playerMove = [playerInput.split(' ')[0].match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(playerInput.split(' ')[0].toLowerCase().match(/[a-j]/)[0])];

                if (playerMove.x != moveOrigin.x || playerMove.y != moveOrigin.y)
                {
                    return "You cannot move that piece right now. During a multi-jump, you can only move the piece highlighted in green, or you can end your turn by saying \"stop\".";
                }
            }
            else
            {
                if (this.checkPiece(moveOrigin, this.turn))
                {
                    continue;
                }

                if (this.checkPiece(moveOrigin, this.turn, true))
                {
                    return "That piece is trapped and cannot be moved until it is freed.";
                }

                if (this.checkPiece(moveOrigin, [1, 0][this.turn]))
                {
                    return "That piece is not yours to move.";
                }

                if (this.checkPiece(moveOrigin, [1, 0][this.turn], true))
                {
                    return `That piece is not yours, but it is trapped!\nYou can capture it by saying "${playerInput.split(' ')[0]} capture"`;
                }

                if (this.checkPiece(moveOrigin, 3))
                {
                    return "You do not have a piece in that space.";
                }
            }

            let move1 = this.getAdjacentPiece(moveOrigin, moveDirection, 1);
            let move2 = this.getAdjacentPiece(moveOrigin, moveDirection, 2);
            let move3 = this.getAdjacentPiece(moveOrigin, moveDirection, 3);
            let move4 = this.getAdjacentPiece(moveOrigin, moveDirection, 4);

            if (this.checkPiece(move1, 4) || (!this.checkPiece(move1, 3) && this.checkPiece(move2, 4)))
            {
                return "That would move this piece off the board.";
            }

            if (!this.checkPiece(move1, 3) && !this.checkPiece(move2, 3))
            {
                return "There are pieces blocking that move.";
            }

            if (this.checkPiece(move1, 3))
            {
                if (this.playerIsJumping)
                {
                    return "There is not a piece you can jump in that direction.";
                }

                let D = (moveDirection + 1) % 2;
                let R = D + 2;

                let dir1 = this.getAdjacentPiece(move1, D, 1);
                let dir2 = this.getAdjacentPiece(move1, D, 2);
                let rir1 = this.getAdjacentPiece(move1, R, 1);
                let rir2 = this.getAdjacentPiece(move1, R, 2);
                if (this.checkPiece(dir1, [1, 0][this.turn]) && this.checkPiece(rir1, [1, 0][this.turn]) && !this.checkPiece(dir2, this.turn) && !this.checkPiece(rir2, this.turn))
                {
                    return "That move would put this piece in a trapped position.";
                }

                this.board[moveOrigin[0]][moveOrigin[1]] = false;
                this.board[move1[0]][move1[1]] = this.turn;
                this.highlight.push([moveOrigin[0], moveOrigin[1], 1]);
                this.highlight.push([move1[0], move1[1], 0]);

                for (let d = 0; d < 4; d++)
                {
                    let dir1 = this.getAdjacentPiece(move1, d, 1);
                    let dir2 = this.getAdjacentPiece(move1, d, 2);

                    if (this.checkPiece(dir1, [1, 0][this.turn]) && this.checkPiece(dir2, this.turn))
                    {
                        this.board[dir1[0]][dir1[1]] = [[1, 0][this.turn], d % 2];
                        this.highlight.push([dir1[0], dir1[1], 2]);

                        for (let D = 0; D < 4; D++)
                        {
                            let DIR = this.getAdjacentPiece(dir1, D, 1);

                            if (this.checkPiece(DIR, this.turn, true) && this.board[DIR[0]][DIR[1]][1] == D % 2)
                            {
                                this.board[DIR[0]][DIR[1]] = this.turn;
                                this.highlight.push([DIR[0], DIR[1], 3]);
                            }
                        }
                    }
                }
                for (let d = 0; d < 4; d++)
                {
                    let dir1 = this.getAdjacentPiece(moveOrigin, d, 1);

                    if (this.checkPiece(dir1, [1, 0][this.turn], true) && this.board[dir1[0]][dir1[1]][1] == d % 2)
                    {
                        this.board[dir1[0]][dir1[1]] = [1, 0][this.turn];
                        this.highlight.push([dir1[0], dir1[1], 3]);
                    }
                }
            }

            else if (!this.checkPiece(move1, 3) && this.checkPiece(move2, 3))
            {
                if (this.playerIsJumping)
                {
                    if (this.playerIsJumping[1][moveDirection] == 1)
                    {
                        return "You cannot backtrack on a multi-jump.";
                    }

                    if (this.playerIsJumping[1][moveDirection] == 2)
                    {
                        return "That would move this piece off the board.";
                    }

                    if (this.playerIsJumping[1][moveDirection] == 3)
                    {
                        return "There is not a piece you can jump in that direction.";
                    }

                    if (this.playerIsJumping[1][moveDirection] == 4)
                    {
                        return "There are pieces blocking a jump in that direction.";
                    }

                    if (this.playerIsJumping[1][moveDirection] == 5)
                    {
                        return "That jump would put this piece in a trapped position.";
                    }
                }

                let D1 = (moveDirection + 1) % 2;
                let R1 = D1 + 2;

                let Dir1 = this.getAdjacentPiece(move2, D1, 1);
                let Dir2 = this.getAdjacentPiece(move2, D1, 2);
                let Rir1 = this.getAdjacentPiece(move2, R1, 1);
                let Rir2 = this.getAdjacentPiece(move2, R1, 2);

                if ((this.checkPiece(move1, [1, 0][this.turn]) && this.checkPiece(move3, [1, 0][this.turn]) && !this.checkPiece(move4, this.turn)) || this.checkPiece(Dir1, [1, 0][this.turn]) && this.checkPiece(Rir1, [1, 0][this.turn]) && !this.checkPiece(Dir2, this.turn) && !this.checkPiece(Rir2, this.turn))
                {
                    return "That move would put this piece in a trapped position.";
                }

                this.board[moveOrigin[0]][moveOrigin[1]] = false;
                this.board[move2[0]][move2[1]] = this.turn;
                this.highlight.push([move2[0], move2[1], 0]);

                let dirs = [0, 0, 0, 0];

                for (let d = 0; d < 4; d++)
                {
                    let dir1 = this.getAdjacentPiece(move2, d, 1);
                    let dir2 = this.getAdjacentPiece(move2, d, 2);
                    let dir3 = this.getAdjacentPiece(move2, d, 3);
                    let dir4 = this.getAdjacentPiece(move2, d, 4);

                    let D2 = (d + 1) % 2;
                    let R2 = D2 + 1;

                    let DIR1 = this.getAdjacentPiece(dir2, D2, 1);
                    let DIR2 = this.getAdjacentPiece(dir2, D2, 2);
                    let RIR1 = this.getAdjacentPiece(dir2, R2, 1);
                    let RIR2 = this.getAdjacentPiece(dir2, R2, 2);
                    if (d == [2, 3, 0, 1][moveDirection])
                    {
                        dirs[d] = 1;
                    }

                    else if (this.checkPiece(dir2, 4))
                    {
                        dirs[d] = 2;
                    }

                    else if (this.checkPiece(dir1, 3))
                    {
                        dirs[d] = 3;
                    }

                    else if (!this.checkPiece(dir2, 3))
                    {
                        dirs[d] = 4;
                    }

                    else if (this.checkPiece(dir1, [1, 0][this.turn]) && this.checkPiece(dir3, [1, 0][this.turn]) && !this.checkPiece(dir4, this.turn))
                    {
                        dirs[d] = 5;
                    }

                    else if (this.checkPiece(DIR1, [1, 0][this.turn]) && this.checkPiece(RIR1, [1, 0][this.turn]) && !this.checkPiece(DIR2, this.turn) && !this.checkPiece(RIR2, this.turn))
                    {
                        dirs[d] = 5;
                    }
                }
                if (dirs.includes(0))
                {
                    if (this.playerIsJumping)
                    {
                        jump_ = this.playerIsJumping[2];
                        jump_.push([moveOrigin[0], moveOrigin[1], 1]);
                        this.playerIsJumping = [move2, dirs, jump_];
                    }

                    else
                    {
                        this.playerIsJumping = [move2, dirs, [[moveOrigin[0], moveOrigin[1], 1]]];
                    }

                    for (let i of this.playerIsJumping[2])
                    {
                        this.highlight.push(i);
                    }
                }

                else
                {
                    this.playerIsJumping = false;
                    this.highlight.push([moveOrigin[0], moveOrigin[1], 1]);
                }

                for (let d = 0; d < 4; d++)
                {
                    let dir1 = this.getAdjacentPiece(move2, d, 1), dir2 = this.getAdjacentPiece(move2, d, 2);
                    if (this.checkPiece(dir1, [1, 0][this.turn]) && this.checkPiece(dir2, this.turn))
                    {
                        this.board[dir1[0]][dir1[1]] = [[1, 0][this.turn], d % 2];
                        this.highlight.push([dir1[0], dir1[1], 2]);

                        for (let D = 0; D < 4; D++)
                        {
                            let DIR = [dir1[0] + [-1, 0, 1, 0][D], dir1[1] + [0, 1, 0, -1][D]];
                            if (this.checkPiece(DIR, this.turn, true) && this.board[DIR[0]][DIR[1]][1] == D % 2)
                            {
                                this.board[DIR[0]][DIR[1]] = this.turn;
                                this.highlight.push([DIR[0], DIR[1], 3]);
                            }
                        }
                    }
                }
                for (let d = 0; d < 4; d++)
                {
                    let dir1 = [moveOrigin[0] + [-1, 0, 1, 0][d], moveOrigin[1] + [0, 1, 0, -1][d]];
                    if (this.checkPiece(dir1, [1, 0][this.turn], true) && this.board[dir1[0]][dir1[1]][1] == d % 2)
                    {
                        this.board[dir1[0]][dir1[1]] = [1, 0][this.turn];
                        this.highlight.push([dir1[0], dir1[1], 3]);
                    }
                }
            }
        }

        else if (/^([1-8][a-h]|[a-h][1-8]) (remove|capture|cap|delete)$/i.test(playerInput))
        {
            if (this.playerIsJumping)
            {
                return "You cannot capture on the same turn you move a piece; you must either continue jumping or end your turn.";
            }

            let piece = [playerInput.split(' ')[0].match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(playerInput.split(' ')[0].toLowerCase().match(/[a-j]/)[0]), 2];

            if (this.checkPiece(piece, [1, 0][this.turn], true))
            {
                this.board[piece[0]][piece[1]] = false;
                this.highlight.push([piece[0], piece[1], 2]);
            }
            else if (this.checkPiece(piece, this.turn, true))
            {
                return "You cannot remove your own trapped pieces from the game.";
            }
            else if (this.checkPiece(piece, [1, 0][this.turn]))
            {
                return "That piece is not trapped and cannot be removed.";
            }
            else if (this.checkPiece(piece, this.turn))
            {
                return "You cannot remove your own pieces from the game.";
            }
            else if (this.checkPiece(piece, 3))
            {
                return "There is no piece there to be removed.";
            }
        }

        else if (/^([1-8][a-h]|[a-h][1-8])$/i.test(playerInput))
        {
            return "Please specify which direction you wish to move that piece.";
        }

        else if (/^(end|stop)$/i.test(playerInput))
        {
            if (this.playerIsJumping)
            {
                this.playerIsJumping = false;
            }
            else
            {
                // return "You have to take your turn. Otherwise, just say \"x!latrones forfeit\".";
                return "You haven't gone yet!";
            }
        }

        let pieceCount = [0, 0];

        for (let x = 0; x < 8; x++)
        {
            for (let y = 0; y < 8; y++)
            {
                if (this.checkPiece([x, y], 0)) pieceCount[0]++;
                if (this.checkPiece([x, y], 1)) pieceCount[1]++;
            }
        }

        let hasMove = false;
        for (let y = 0, x = 0, d = 0; y < 8; d < 3 ? d++ : (d = 0, x < 7 ? x++ : (y++, x = 0)))
        {
            if (this.checkPiece([x, y], this.turn, true))
            {
                hasMove = true;
                break;
            }
            if (!this.checkPiece([x, y], [1, 0][this.turn]))
            {
                continue;
            }

            let xy1 = this.getAdjacentPiece([x, y], d, 1);
            let xy2 = this.getAdjacentPiece([x, y], d, 2);
            let xy3 = this.getAdjacentPiece([x, y], d, 3);
            let xy4 = this.getAdjacentPiece([x, y], d, 4);

            if (this.checkPiece(xy1, 3))
            {
                let D = (d + 1) % 2;
                let R = D + 1;
                let DIR1 = this.getAdjacentPiece(xy1, D, 1);
                let DIR2 = this.getAdjacentPiece(xy1, D, 2);
                let RIR1 = this.getAdjacentPiece(xy1, R, 1);
                let RIR2 = this.getAdjacentPiece(xy1, R, 2);

                if (!(this.checkPiece(DIR1, this.turn) && this.checkPiece(RIR1, this.turn) && !this.checkPiece(DIR2, [1, 0][this.turn]) && !this.checkPiece(RIR2, [1, 0][this.turn])))
                {
                    hasMove = true;
                    break;
                }
            }

            if (!this.checkPiece(xy1, 3) && this.checkPiece(xy2, 3) && (!this.checkPiece(xy3, this.turn) || (this.checkPiece(xy3, this.turn) && this.checkPiece(xy4, [1, 0][this.turn]))))
            {
                let D = (d + 1) % 2;
                let R = D + 1;
                let DIR1 = this.getAdjacentPiece(xy2, D, 1);
                let DIR2 = this.getAdjacentPiece(xy2, D, 2);
                let RIR1 = this.getAdjacentPiece(xy2, R, 1);
                let RIR2 = this.getAdjacentPiece(xy2, R, 2);

                if (!this.checkPiece(DIR1, this.turn) || !this.checkPiece(RIR1, this.turn) || this.checkPiece(DIR2, [1, 0][this.turn]) || this.checkPiece(RIR2, [1, 0][this.turn]))
                {
                    hasMove = true;
                    break;
                }
            }
        }

        if (pieceCount[0] <= 1)
        {
            this.end = 1;
            this.winner = 1;
        }

        else if (pieceCount[1] <= 1)
        {
            this.end = 1;
            this.winner = 0;
        }

        else if (!hasMove)
        {
            this.end = 2;
            this.winner = this.turn;
        }

        else if (!this.playerIsJumping)
        {
            this.turn = [1, 0][this.turn];
            this.player = this.players[this.turn];
            this.winner = false;
        }

        this.replay.push(playerInput);

        return false;
    }

    AITurn() {
        let X = (Math.random() * 7 | 0) + 1;
        return X;
    }

    setPriorities() {

    }
}