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
        for (let i=0; i<10; i++) {
            this.fillRandomCell();
        }
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
        return this.field.reduce((allRows, currentRow) => {
            return allRows.concat(currentRow)
        }, []).filter(cell => {
            return cell.value === 0
        }).length;
    }

    mergeLeft(reverse) {
        this.field.forEach(row => {
            this.mergingCell = undefined;
            let cells = row;
            if (reverse) {
                cells = row.slice().reverse()
            }
            cells.forEach(cell => {
                this.merge(cell)
            })
        })
    }

    mergeUp(reverse) {
        for (let column = 0; column<this.fieldSize; column++) {
            this.mergingCell = undefined;
            let cells = [];
            for (let row = 0; row<this.fieldSize; row++) {
                cells.push(this.field[row][column]);
            }
            if (reverse) {
                cells = cells.reverse()
            }
            cells.forEach(cell => {
                this.merge(cell)
            })
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

    moveLeft (reverse) {
        this.field.forEach(row => {
            if (reverse) {
                this.sort(row.slice().reverse())
            } else {
                this.sort(row)
            }
        })
    }

    moveUp(reverse) {
        for (let column = 0; column<this.fieldSize; column++) {
            let cells = [];
            for (let row = 0; row<this.fieldSize; row++) {
                let cell = this.field[row][column];
                cells.push(cell)
            }
            if (reverse) {
                this.sort(cells.slice().reverse())
            } else {
                this.sort(cells)
            }
        }
    }

    sort (cells) {
        let numberCellsCount = cells.filter(cell => {
            return cell.value
        }).length;
        let moveBlocks = 0;
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
        this.field.reduce((allRows, currentRow) => {
            return allRows.concat(currentRow)
        }, []).map(cell => {
            cell.moveBlocks = 0
        });
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

    findUnmovedCellsCount () {
        return this.field.reduce((allRows, currentRow) => {
            return allRows.concat(currentRow)
        }, []).filter(cell => {
            return cell.moveBlocks
        }).length;
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
        field.reduce((previousRow, currentRow) => {
            return previousRow.concat(currentRow)
        }, []).filter(cell => {
            return cell.value
        }).map(cell => {
            let position = `left:${cell.column * 100}px;top:${cell.row * 100}px`;
            let id = `row${cell.row}column${cell.column}`;
            cellsHTML += `<div class="cell" data-value="${cell.value}" id="${id}" style="${position}">${cell.value}</div>`
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
                game.mergeLeft('reverse');
                game.moveLeft('reverse');
                game.moveDirection = 'right'
            } else if (key === 40) {
                game.mergeUp('reverse');
                game.moveUp('reverse');
                game.moveDirection = 'down'
            }
            /*function move() {
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
            move();*/
            Draw.background(game.fieldSize);
            Draw.cells(game.field);
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

