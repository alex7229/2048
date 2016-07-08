class Game {

    constructor () {
        this.field = [];
        this.fieldSize = 4;
        this.mergingCell;
        this.moveDirection;
    }
    
    setFieldSize (size) {
        this.fieldSize = size;
    }
    
    start () {
        this.field = [];
        for (let row=0; row<this.fieldSize; row++) {
            this.field[row] = [];
            for (let column=0; column<this.fieldSize; column++) {
                this.field[row][column] = {
                    value: 0,
                    row,
                    column,
                    moveBlocks: 0,
                    isMerged: false
                }
            }
        }
        for (let i=0; i<32; i++) {
            this.fillRandomCell();
        }
        /*this.field[0][0].value = 2;
        this.field[0][1].value = 2;
        this.field[0][2].value = 4;
        this.field[0][3].value = 4;*/
        Draw.background(this.fieldSize);
        Draw.cells(this.field);
        score.reset()
    }

    fillRandomCell () {
        if (!this.countEmptyCells()) return;
        let number = 2;
        if (Math.random()<0.2) {
            number = 4
        }
        let row = Math.floor(Math.random()*this.fieldSize);
        let column = Math.floor(Math.random()*this.fieldSize);
        if (this.field[row][column].value) {
            this.fillRandomCell()
        } else {
            this.field[row][column].value = number;
        }
    }

    countEmptyCells () {
        let number = 0;
        this.field.forEach(row  => {
            row.forEach( cell => {
                if (cell.value === 0) {
                    number++
                }
            })
        });
        return number
    }

    mergeLeft () {
        this.field.forEach(row => {
            this.mergingCell = undefined;
            for (let column=0; column<this.fieldSize; column++) {
                let cell = row[column];
                this.merge(cell);
            }
        });
    }

    mergeRight () {
        this.field.forEach(row => {
            this.mergingCell = undefined;
            for (let column=this.fieldSize-1; column>=0; column--) {
                let cell = row[column];
                this.merge(cell);
            }
        });
    }

    mergeUp () {
        for (let column = 0; column<this.fieldSize; column++) {
            this.mergingCell = undefined;
            for (let row = 0; row<this.fieldSize; row++) {
                let cell = this.field[row][column];
                this.merge(cell)
            }
        }
    }

    mergeDown () {
        for (let column = 0; column<this.fieldSize; column++) {
            this.mergingCell = undefined;
            for (let row = this.fieldSize-1; row>=0; row--) {
                let cell = this.field[row][column];
                this.merge(cell)
            }
        }
    }

    merge (currentCell) {
        if (!this.mergingCell) {
            if (currentCell.value) {
                this.mergingCell = currentCell
            }
        } else if (currentCell.value) {
            if (this.mergingCell.value === currentCell.value) {
                this.mergingCell.value *= 2;
                score.addScore(this.mergingCell.value);
                Game.countMoveAfterMerge(this.mergingCell, currentCell);
                this.mergingCell = undefined;
                currentCell.value = 0;
                currentCell.isMerged = true
            } else {
                this.mergingCell = currentCell
            }
        }
    }

    static countMoveAfterMerge (previousCell, currentCell) {
        let verticalDifference = Math.abs(currentCell.row-previousCell.row);
        let horizontalDifference = Math.abs(currentCell.column-previousCell.column);
        if (verticalDifference) {
            currentCell.moveBlocks = verticalDifference
        } else {
            currentCell.moveBlocks = horizontalDifference
        }
    }

    moveLeft () {
        this.field.forEach(row => {
            this.sort(row)
        })
    }

    moveRight() {
        this.field.forEach(row => {
            let reverseRow = [];
            for (let column = row.length-1; column>=0; column --) {
                reverseRow.push(row[column])
            }
            this.sort(reverseRow)
        })
    }

    moveUp() {
        for (let column = 0; column<this.fieldSize; column++) {
            let cells = [];
            for (let row = 0; row<this.fieldSize; row++) {
                let cell = this.field[row][column];
                cells.push(cell)
            }
            this.sort(cells)
        }
    }

    moveDown() {
        for (let column = 0; column<this.fieldSize; column++) {
            let cells = [];
            for (let row = this.fieldSize-1; row>=0; row--) {
                let cell = this.field[row][column];
                cells.push(cell)
            }
            this.sort(cells)
        }
    }

    sort (cells) {
        let numberCellsCount = 0;
        let moveBlocks = 0;
        cells.forEach(cell => {
            if (cell.value) {
                numberCellsCount++
            }
        });
        if (numberCellsCount === 0 || numberCellsCount === cells.length) return;
        for (let i=0; i<cells.length; i++) {
            if (cells[i].value === 0) {
                for (let j=i+1; j<cells.length; j++) {
                    moveBlocks++;
                    if (cells[j].value) {
                        cells[i].value = cells[j].value;
                        cells[j].value = 0;
                        cells[j].moveBlocks += moveBlocks;
                        moveBlocks = 0;
                        break
                    }
                }
            }
        }
    }

    resetMoveData () {
        this.field.forEach(row => {
            row.forEach(cell => {
                cell.moveBlocks = 0
            })
        })
    }

    saveFieldAsString () {
        this.fieldString = JSON.stringify(this.field);
    }

    checkFieldChanges () {
        let currentField = JSON.stringify(this.field);
        if (this.fieldString !== currentField) {
            return true
        }
    }

    checkUnmovedCells () {
        let unmovedCells = false;
        this.field.forEach(row => {
            row.forEach(cell => {
                if (cell.moveBlocks) {
                    unmovedCells  = true;
                }
            })
        });
        console.log(unmovedCells);
        return unmovedCells
    }

}

class Draw {

    static move (field, direction) {
        field.forEach(row => {
            row.forEach(cell => {
                let id = `#row${cell.row}column${cell.column}`;
                if (cell.moveBlocks) {
                    if (direction === 'down') {
                        $(id).animate({
                            top: (cell.row+1)*100
                        }, 500)
                    } else if (direction === 'up') {
                        $(id).animate({
                            top: (cell.row-1)*100
                        }, 500)
                    } else if (direction === 'left') {
                        $(id).animate({
                            left: (cell.column-1)*100
                        }, 500)
                    } else if (direction === 'right') {
                        $(id).animate({
                            left: (cell.column+cell.moveBlocks)*100
                        }, 500)
                    }
                } else if (cell.isMerged) {
                    cell.isMerged = false;
                    $(id).css('display', 'none')
                }
            })
        })
    }

    static background (fieldSize) {
        let container = $('#gameContainer');
        let innerHtml = ``;
        for (let row=0; row<fieldSize; row++) {
            for (let column=0; column<fieldSize; column++) {
                if (column === 0) {
                    innerHtml+=`<div class="backgroundCell" style="clear:both"></div>`
                } else {
                    innerHtml+=`<div class="backgroundCell"></div>`
                }
            }
            innerHtml+=`<br>`
        }
        container.html(innerHtml);
    }

    static cells (field) {
        let container = $('#gameContainer');
        let cellsHTML = ``;
        field.forEach(row => {
            row.forEach(cell => {
                if (cell.value) {
                    let position = `left:${cell.column*100}px;top:${cell.row*100}px`;
                    let id = `row${cell.row}column${cell.column}`;
                    cellsHTML+=`<div class="cell" data-value="${cell.value}" id="${id}" style="${position}">${cell.value}</div>`
                }

            })
        });
        container.append(cellsHTML)
    }
}

class Score {
    
    constructor () {
        this.topScore = 0;
        this.currentScore = 0;
        this.multiplier = 0;
        this.stepScore = 0;
    }
    
    getTopScore () {
        if (localStorage.topScore2048) {
            this.topScore = localStorage.topScore2048
        }
    }

    update () {
        $('#topScoreValue').html(this.topScore);
        $('#currentScoreValue').html(this.currentScore);
    }

    addScore (value) {
        this.stepScore+=value;
        this.multiplier++
    }

    endStep () {
        this.currentScore+=this.stepScore*this.multiplier;
        this.stepScore = 0;
        this.multiplier = 0;
        if (this.currentScore>this.topScore) {
            this.topScore = this.currentScore;
            localStorage.topScore2048 = this.topScore
        }
        this.update()
    }

    reset () {
        this.currentScore = 0;
    }
    
}

class Controller {

    static listenArrowKeys () {
        document.onkeydown = e => {
            let key = e.keyCode;
            game.resetMoveData();
            game.saveFieldAsString();
            if (key === 37) {
                game.mergeLeft();
                game.moveLeft();
                game.moveDirection = 'left'
            } else if (key === 38) {
                game.mergeUp();
                game.moveUp();
                game.moveDirection = 'up'
            } else if (key === 39) {
                //game.mergeRight();
                game.moveRight();
                game.moveDirection = 'right'
            } else if (key === 40) {
                game.mergeDown();
                game.moveDown();
                game.moveDirection = 'down'
            }
            function move() {
                Draw.move(game.field, game.moveDirection);
                function lasti () {
                    Draw.background(game.fieldSize);
                    Draw.cells(game.field);
                    game.mergeRight();
                    Draw.move(game.field, game.moveDirection)
                }
                function anotherMove() {
                    Draw.background(game.fieldSize);
                    Draw.cells(game.field);
                    game.moveRight();
                    Draw.move(game.field, game.moveDirection)
                }
                function finalDraw() {
                    Draw.background(game.fieldSize);
                    Draw.cells(game.field);
                }
                setTimeout(lasti, 500);
                setTimeout(anotherMove, 1000);
                setTimeout(finalDraw, 1500)
            }
            move();
            score.endStep();
        }
    }

}


let game = new Game();

let score = new Score();

Controller.listenArrowKeys();

$(document).ready(()=> {
    score.getTopScore();
    score.update();
});



